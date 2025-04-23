import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { storage } from '../storage';

// Global array to store the latest uploads (used for recovery)
interface UploadRecord {
  url: string;
  filename: string;
  timestamp: string;
  userId: number | undefined;
}

// This global state is used for recovery if the client can't parse the response
const globalLatestUploads: UploadRecord[] = [];

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
    console.log('Authentication state:', {
      isAuthenticated: req.isAuthenticated(),
      sessionID: req.sessionID,
      userInPassport: !!req.user,
      userInSession: !!req.session?.user
    });
    console.log('Session:', req.session);
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Enhanced authentication check - we now enforce authentication from either method
    if (!req.isAuthenticated() && !req.session?.user) {
      console.log('User not authenticated via passport or session - rejecting upload');
      console.log('Session data:', req.session);
      console.log('Session cookie in headers:', req.headers.cookie);
      
      // Delete the uploaded file to prevent storage issues
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error('Error deleting unauthorized upload:', err);
        }
      }
      
      return res.status(401).json({ 
        error: 'Unauthorized - Please log in before uploading images',
        sessionExists: !!req.session,
        sessionId: req.sessionID || 'not available'
      });
    } else {
      // Log which auth method worked
      if (req.isAuthenticated()) {
        console.log('User authenticated via passport:', req.user.username);
      }
      if (req.session?.user) {
        console.log('User authenticated in session:', req.session.user.username);
      }
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
    
    // Store the latest upload in a global variable for recovery purposes
    globalLatestUploads.unshift({
      url: imageUrl,
      filename: processedFilename,
      timestamp: new Date().toISOString(),
      userId: req.user?.id || req.session?.user?.id
    });
    
    // Keep only the latest 10 uploads
    if (globalLatestUploads.length > 10) {
      globalLatestUploads.pop();
    }
    
    // Send a direct text response with just the URL to avoid any JSON parsing issues
    // This is more robust since the client can still extract the URL even from HTML or mixed responses
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(imageUrl);
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    
    // Ensure a proper error JSON response
    try {
      res.status(500).json({ 
        error: 'Error processing uploaded file', 
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } catch (jsonError) {
      console.error('Error sending JSON error response:', jsonError);
      // Fallback to manually-formatted JSON
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send(JSON.stringify({ 
        error: 'Error processing uploaded file', 
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }
});

// Route for updating business logo
router.patch('/api/business/update-logo', async (req, res) => {
  try {
    console.log('Received update logo request with body:', req.body);
    console.log('Authentication state:', {
      sessionID: req.sessionID,
      hasSession: !!req.session,
      sessionData: req.session,
      isAuthenticated: req.isAuthenticated(),
      userInPassport: !!req.user,
      userInSession: !!req.session?.user
    });
    
    // Enhanced authentication check - we try both methods to be robust
    // First check if authenticated via passport
    if (!req.isAuthenticated() && !req.session?.user) {
      console.log('User not authenticated - neither via passport nor session');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { logoUrl } = req.body;
    
    // Get user ID from either passport or session (passport is preferred)
    const userId = req.user?.id || req.session?.user?.id;
    if (!userId) {
      console.log('Could not determine user ID');
      return res.status(401).json({ error: 'Could not determine user ID' });
    }
    
    console.log(`User ID from auth: ${userId}`);
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
    
    // Ensure a proper JSON response even if the json() method fails
    try {
      res.status(200).json({ 
        ...userWithoutPassword,
        success: true 
      });
    } catch (jsonError) {
      console.error('Error sending JSON response:', jsonError);
      // Fallback to manually-formatted JSON
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify({ 
        ...userWithoutPassword,
        success: true 
      }));
    }
  } catch (error) {
    console.error('Error updating logo:', error);
    
    // Ensure a proper error JSON response
    try {
      res.status(500).json({ 
        error: 'Error updating logo', 
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } catch (jsonError) {
      console.error('Error sending JSON error response:', jsonError);
      // Fallback to manually-formatted JSON
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send(JSON.stringify({ 
        error: 'Error updating logo', 
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }
});

// Debug route to check authentication status
router.get('/api/auth-status', (req, res) => {
  console.log('Auth status check requested');
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Is authenticated:', req.isAuthenticated());
  console.log('User in session:', req.session?.user ? 'Yes' : 'No');
  
  if (req.isAuthenticated()) {
    console.log('User authenticated via passport:', req.user.username);
  }
  
  if (req.session?.user) {
    console.log('User authenticated via session:', req.session.user.username);
  }
  
  // Return auth status - with robust error handling
  try {
    res.status(200).json({
      authenticated: req.isAuthenticated() || !!req.session?.user,
      method: req.isAuthenticated() ? 'passport' : (req.session?.user ? 'session' : 'none'),
      sessionID: req.sessionID,
      sessionExists: !!req.session,
      userInSession: !!req.session?.user,
      userInPassport: req.isAuthenticated(),
      success: true
    });
  } catch (jsonError) {
    console.error('Error sending auth status JSON response:', jsonError);
    // Fallback to manually-formatted JSON
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({
      authenticated: req.isAuthenticated() || !!req.session?.user,
      method: req.isAuthenticated() ? 'passport' : (req.session?.user ? 'session' : 'none'),
      sessionID: req.sessionID,
      sessionExists: !!req.session,
      userInSession: !!req.session?.user,
      userInPassport: req.isAuthenticated(),
      success: true
    }));
  }
});

// Fallback endpoint for retrieving latest uploads (used for recovery)
router.get('/api/uploads/latest', (req, res) => {
  console.log('Latest uploads requested');
  console.log('Authentication state:', {
    isAuthenticated: req.isAuthenticated(),
    sessionID: req.sessionID,
    userInPassport: !!req.user,
    userInSession: !!req.session?.user
  });
  
  // Require authentication
  if (!req.isAuthenticated() && !req.session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Get user ID from either passport or session
  const userId = req.user?.id || req.session?.user?.id;
  
  // Filter uploads by user ID if available
  let userUploads = globalLatestUploads;
  if (userId) {
    userUploads = globalLatestUploads.filter(upload => upload.userId === userId);
  }
  
  console.log(`Found ${userUploads.length} uploads for user ID ${userId || 'unknown'}`);
  
  res.status(200).json(userUploads);
});

export default router;