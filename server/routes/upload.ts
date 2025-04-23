import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const uploadRouter = Router();

// Get current file path and directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter to only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Setup multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload image endpoint
uploadRouter.post('/upload-image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get the user ID from the session to ensure authorization
    const userId = req.user?.id;

    if (!userId) {
      // Remove the uploaded file if user is not authenticated
      fs.unlinkSync(req.file.path);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Create optimized version with sharp
    const originalFilePath = req.file.path;
    const optimizedFilePath = path.join(
      uploadsDir,
      `optimized-${path.basename(originalFilePath)}`
    );

    await sharp(originalFilePath)
      .resize(800) // Resize to max width of 800px
      .jpeg({ quality: 80 }) // Compress to JPEG with 80% quality
      .toFile(optimizedFilePath);

    // Remove the original file after optimization
    fs.unlinkSync(originalFilePath);

    // Generate URL path (relative to the server root)
    const imageUrl = `/uploads/optimized-${path.basename(originalFilePath)}`;

    res.status(200).json({
      imageUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Clean up the file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Failed to upload image'
    });
  }
});

export default uploadRouter;