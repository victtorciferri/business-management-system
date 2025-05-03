import { Router } from "express";
const router = Router();

insertCustomerAccessTokenSchema,
// Extend the Express Session to include user
declare module 'express-session' {
  interface SessionData {
import session from "express-session";
// Helper function to send customer access token emails
const sendTokenEmail = async (req: Request, token: string, customer: Customer, business: User) => {
    const accessUrl = `${baseUrl}/customer-portal?token=${token}`;
    console.log(`Sending access token email to ${customer.email} with URL: ${accessUrl.substring(0, 30)}...`);
    console.error("Error sending access token email:", error);
  // Set up memory-backed session store for development
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "appointease-secret-key",
  app.use(sessionMiddleware);
  app.post("/api/login", async (req: Request, res: Response) => {
      // Store user in session for authentication
      req.session.user = user;
      // Ensure session is saved before sending response
      req.session.save(err => {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Session save failed" });
        console.log("Login successful for user:", user.username);
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
      sessionID: req.sessionID,
      hasSession: !!req.session,
      sessionCookie: req.session?.cookie,
      userInSession: !!req.session?.user,
      sessionData: req.session
    if (!req.session?.user) {
      userID: req.session.user.id,
      username: req.session.user.username
    return res.json(req.session.user);
   * This is used for debugging session issues
      isAuthenticated: !!req.session?.user,
      sessionID: req.sessionID,
      hasSession: !!req.session,
      sessionCookie: req.session?.cookie,
    if (req.session) {
      req.session.destroy((err) => {
  // Customer Access Token routes
  app.post("/api/customer-access-token", async (req: Request, res: Response) => {
      console.log(`Creating customer access token for: ${email}, business ID: ${businessId}`);
      // First check if there's already a valid token for this customer
        // Query to find existing active tokens for this customer
          'SELECT * FROM customer_access_tokens WHERE customer_id = $1 AND business_id = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
        // If we found an existing valid token, use it instead of creating a new one
          const existingToken = rows[0];
          console.log(`Found existing valid token (ID: ${existingToken.id}) for customer, expires: ${new Date(existingToken.expires_at).toISOString()}`);
            'UPDATE customer_access_tokens SET last_used_at = NOW() WHERE id = $1',
            [existingToken.id]
            sendTokenEmail(req, existingToken.token, customer, business);
          // Return the existing token
            token: existingToken.token,
            expiresAt: existingToken.expires_at,
            message: "Using existing valid token"
      } catch (existingTokenError) {
        console.error("Error checking for existing tokens:", existingTokenError);
        // Continue with creating a new token if the check fails
      // Generate a random token
      const token = crypto.randomBytes(32).toString('hex');
      console.log(`Generated new token for customer ID ${customer.id}, expires: ${expiresAt.toISOString()}`);
      // Create the access token in the database
      let accessToken;
        accessToken = await storage.createCustomerAccessToken({
          token,
        console.log(`Created new access token with ID: ${accessToken.id}`);
      } catch (tokenCreateError) {
        console.error("Error creating access token in database:", tokenCreateError);
        return res.status(500).json({ message: "Failed to create access token" });
        sendTokenEmail(req, token, customer, business);
      // Return the token
        token: accessToken.token,
        expiresAt: accessToken.expiresAt 
      console.error("Error creating customer access token:", error);
      res.status(500).json({ message: "Failed to create customer access token" });
      // Get the token from the Authorization header or query parameter
      const token = authHeader?.startsWith('Bearer ') 
        : req.query.token as string;
      console.log(`Customer-profile endpoint accessed with token: ${token ? token.substring(0, 10) + '...' : 'none'}`);
      if (!token) {
        console.log('No token provided in the request');
        return res.status(401).json({ message: "Access token is required" });
      // Get the customer using the access token
      console.log(`Looking up customer with token: ${token.substring(0, 10)}...`);
      const customer = await storage.getCustomerByAccessToken(token);
        console.log('No customer found with provided token');
        return res.status(401).json({ message: "Invalid or expired access token" });
      // Generate a new access token
      const token = crypto.randomBytes(32).toString('hex');
      // Create the access token in the database
      await storage.createCustomerAccessToken({
        token,
      const accessUrl = `${baseUrl}/customer-portal?token=${token}`;
        if (!business.mercadopagoAccessToken) {
      if (!req.session?.user) {
      const userId = req.session.user.id;
      if (!req.session?.user) {
      const userId = req.session.user.id;
      if (!req.session?.user) {
      const userId = req.session.user.id;
      if (!req.session?.user) {
      const userId = req.session.user.id;
      if (!req.session?.user) {
      const userId = req.session.user.id;
      if (!req.session?.user) {
      const userId = req.session.user.id;
      if (!req.session?.user) {
      if (product.userId !== req.session.user.id) {
      if (!req.session?.user) {
      if (product.userId !== req.session.user.id) {
      if (!req.session?.user) {
      if (product.userId !== req.session.user.id) {
      if (!req.session?.user) {
      if (product.userId !== req.session.user.id) {
      if (!req.session?.user) {
      if (product.userId !== req.session.user.id) {
      if (!req.session?.user) {
      if (product.userId !== req.session.user.id) {
      if (!req.session?.user) {
      if (product.userId !== req.session.user.id) {
      if (req.isAuthenticated && !!req.session?.user) {
        cart = await storage.getCartByUserId(req.session.user.id);
      if (req.isAuthenticated && !!req.session?.user) {
        userId = req.session.user.id;
      if (req.isAuthenticated && !!req.session?.user && cart.userId && cart.userId !== req.session.user.id) {
      if (req.isAuthenticated && !!req.session?.user && cart.userId && cart.userId !== req.session.user.id) {
    // Support both Passport authentication (req.user) and session-based authentication (req.session?.user)
    const user = req.user || req.session?.user;
      sessionExists: !!req.session, 
      userInSession: !!req.session?.user,
      sessionID: req.sessionID
    // For debugging, also log the session and cookies
      console.log('Authentication required - no user in session or request. Session cookie:', req.headers.cookie);
      console.log('Session content:', req.session);
      // Check if session exists but user is missing - try to refresh from passport
      if (req.session && req.sessionID && !req.session.user && !req.user) {
        console.log('Session exists but no user found - this may be a session synchronization issue');
          sessionError: "Session exists but user data is missing"
    if (req.session) {
      req.session.user = user;
      if (!!!req.session?.user) {
      if (req.session.user.role === "staff") {
        const staffMember = await storage.getUser(req.session.user.id);
      if (req.session.user.role !== "business" && req.session.user.role !== "admin") {
      const businessId = req.session.user.role === "business" ? req.session.user.id : undefined;
      const staffMembers = await storage.getStaffByBusinessId(businessId || req.session.user.id);
      if (!!!req.session?.user || (req.session.user.role !== "business" && req.session.user.role !== "admin" && req.session.user.id !== parseInt(req.params.id))) {
      if (req.session.user.role === "business" && staff.businessId !== req.session.user.id) {
      if (!!!req.session?.user || (req.session.user.role !== "business" && req.session.user.role !== "admin")) {
      const businessId = req.session.user.role === "business" ? req.session.user.id : req.body.businessId;
      if (!!!req.session?.user || (req.session.user.role !== "business" && req.session.user.role !== "admin")) {
      if (req.session.user.role === "business" && staff.businessId !== req.session.user.id) {
      if (!!!req.session?.user) {
      if (req.session.user.role === "business" && staff.businessId !== req.session.user.id && req.session.user.id !== staffId) {
      if (!!!req.session?.user) {
      if (req.session.user.role === "business" && staff.businessId !== req.session.user.id && req.session.user.id !== staffId) {
      if (!!!req.session?.user) {
      if (req.session.user.role === "business" && staff?.businessId !== req.session.user.id && req.session.user.id !== availability.staffId) {
      if (!!!req.session?.user) {
      if (req.session.user.role === "business" && staff.businessId !== req.session.user.id && req.session.user.id !== staffId) {
      console.log('Session:', {
        id: req.sessionID,
        user: req.session?.user?.username,
        role: req.session?.user?.role
      if (!req.session?.user) {
      if (req.session.user.role !== 'admin') {
          role: req.session.user.role
          id: req.session.user.id,
          username: req.session.user.username,
          role: req.session.user.role
  app.get("/api/debug/check-admin-session", (req: Request, res: Response) => {
      console.log('Check admin session debug endpoint called');
      console.log('Full session data:', req.session);
      console.log('Session ID:', req.sessionID);
      const user = req.session?.user;
        console.log('No user in session');
          message: 'No user found in session',
          session: {
            id: req.sessionID,
            exists: !!req.session
      console.log('User found in session:', {
        message: 'Admin user found in session',
      console.error('Error in check-admin-session:', error);

export default router;
