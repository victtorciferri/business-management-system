import { Router } from 'express';
import themeRoutes from './theme';

// Create a router to export as a module
const themeApiRoutes = Router();

// Use the theme router for all theme-related routes
themeApiRoutes.use(themeRoutes);

export default themeApiRoutes;