import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { storage } from '../storage';

// ES Module workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for storage
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueFilename);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any);
    }
  }
});

const router = Router();

// Route for uploading images
router.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.isAuthenticated()) {
      // Delete the file if the user is not authenticated
      fs.unlinkSync(req.file.path);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Process the image with sharp
    const processedFilename = `processed_${path.basename(req.file.path)}`;
    const processedPath = path.join(uploadsDir, processedFilename);

    await sharp(req.file.path)
      .resize(800) // Resize to max width of 800px
      .jpeg({ quality: 80 }) // Convert to JPEG with quality 80
      .toFile(processedPath);

    // Remove the original file
    fs.unlinkSync(req.file.path);

    // Return the URL to the processed image
    const imageUrl = `/uploads/${processedFilename}`;
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    res.status(500).json({ error: 'Error processing uploaded file' });
  }
});

// Route for updating business logo
router.patch('/api/business/update-logo', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { logoUrl } = req.body;
    const userId = req.user!.id;

    // Get current user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user with new logo URL
    const updatedUser = await storage.updateUser(userId, { logoUrl });
    
    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update logo' });
    }

    // Omit password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating logo:', error);
    res.status(500).json({ error: 'Error updating logo' });
  }
});

export default router;