/**
 * Debug Routes
 * 
 * These routes are intended for debugging purposes only
 * They should be disabled in production
 */

import { Router } from 'express';

const router = Router();

// Debug authentication status
router.get('/auth-status', (req, res) => {
  console.log('Debug auth status request');
  console.log('Session ID:', req.sessionID);
  console.log('Is authenticated:', req.isAuthenticated());
  console.log('Session:', req.session);
  
  return res.json({
    authenticated: req.isAuthenticated(),
    sessionID: req.sessionID,
    sessionExists: !!req.session,
    user: req.user ? {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      businessName: req.user.businessName,
      businessSlug: req.user.businessSlug,
      role: req.user.role
    } : null
  });
});

// Test login helper
router.post('/login-test', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      message: 'Username and password are required',
      success: false
    });
  }
  
  console.log(`Debug login attempt for username: ${username}`);
  
  // This is just for testing - the actual authentication should happen via passport
  return res.json({
    message: 'This is a debug endpoint. Use the real /api/login endpoint with passport for actual authentication.',
    success: false,
    requestReceived: true,
    username: username
  });
});

// Debug theme creation
router.post('/theme-test', (req, res) => {
  const { name, businessId, businessSlug } = req.body;
  
  console.log('Theme debug request received', {
    name,
    businessId,
    businessSlug,
    isAuthenticated: req.isAuthenticated(),
    user: req.user ? { id: req.user.id, username: req.user.username } : null
  });
  
  // For testing only - simulates a successful theme creation
  return res.status(200).json({
    debug: true,
    success: true,
    themeCreated: {
      id: 999,
      name: name || 'Debug Theme',
      businessId: businessId || (req.user ? req.user.id : 1),
      businessSlug: businessSlug || (req.user ? req.user.businessSlug : 'debugslug'),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
});

export default router;