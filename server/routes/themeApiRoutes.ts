/**
 * Theme API Routes - 2025 Edition
 * 
 * API routes for theme management and accessing themes via the REST API.
 */

import { Router } from 'express';
import themeRoutes from './theme';

// Create a router to export as a module
const themeApiRoutes = Router();

// Use the theme router for all theme-related routes
themeApiRoutes.use(themeRoutes);

// Export the router
export default themeApiRoutes;