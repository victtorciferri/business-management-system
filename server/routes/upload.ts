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
    console.log('Upload request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Authentication status:', req.isAuthenticated());
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.isAuthenticated()) {
      console.log('User not authenticated, deleting file');
      // Delete the file if the user is not authenticated
      fs.unlinkSync(req.file.path);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check uploads directory access
    try {
      console.log('Checking uploads directory:', uploadsDir);
      fs.accessSync(uploadsDir, fs.constants.W_OK);
      console.log('Uploads directory exists and is writable');
    } catch (err) {
      console.error('Uploads directory access error:', err);
    }

    // Process the image with sharp
    const processedFilename = `processed_${path.basename(req.file.path)}`;
    const processedPath = path.join(uploadsDir, processedFilename);
    console.log('Original file path:', req.file.path);
    console.log('Processed file path:', processedPath);

    try {
      // Check if original file exists
      console.log('Checking if original file exists:', req.file.path);
      fs.accessSync(req.file.path, fs.constants.R_OK);
      console.log('Original file exists and is readable');
      
      // Process image
      console.log('Processing image with sharp');
      await sharp(req.file.path)
        .resize(800) // Resize to max width of 800px
        .jpeg({ quality: 80 }) // Convert to JPEG with quality 80
        .toFile(processedPath);
      console.log('Image processing completed');

      // Check if processed file exists
      console.log('Checking if processed file exists:', processedPath);
      fs.accessSync(processedPath, fs.constants.R_OK);
      console.log('Processed file exists and is readable');
    } catch (err) {
      console.error('Error during image processing:', err);
      throw err;
    }

    // Remove the original file
    try {
      console.log('Removing original file:', req.file.path);
      fs.unlinkSync(req.file.path);
      console.log('Original file removed successfully');
    } catch (err) {
      console.error('Error removing original file:', err);
      // Continue even if original file deletion fails
    }

    // Return the URL to the processed image
    const imageUrl = `/uploads/${processedFilename}`;
    console.log('Return URL:', imageUrl);
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    res.status(500).json({ error: 'Error processing uploaded file' });
  }
});

// Route for updating business logo
router.patch('/api/business/update-logo', async (req, res) => {
  try {
    console.log('Received update logo request with body:', req.body);
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { logoUrl } = req.body;
    const userId = req.user!.id;
    
    console.log(`Updating logo for user ID ${userId} with logoUrl: ${logoUrl}`);

    // Get current user
    const user = await storage.getUser(userId);
    if (!user) {
      console.log(`User with ID ${userId} not found`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Current user data:', { ...user, password: '[REDACTED]' });

    // Update user with new logo URL
    const updatedUser = await storage.updateUser(userId, { logoUrl });
    
    if (!updatedUser) {
      console.log('storage.updateUser returned null or undefined');
      return res.status(500).json({ error: 'Failed to update logo' });
    }
    
    console.log('Updated user data:', { ...updatedUser, password: '[REDACTED]' });

    // Omit password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating logo:', error);
    res.status(500).json({ error: 'Error updating logo' });
  }
});

export default router;