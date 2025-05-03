import { Router } from "express";
const router = Router();

insertProductSchema,
  insertProductVariantSchema,
  insertCartSchema,
  insertCartItemSchema,
      // Very simple rate limiting - in production, use a proper rate limiting middleware
      // In production, we would use a service like SendGrid or use a configured SMTP server
  // Product routes
  app.get("/api/products", async (req: Request, res: Response) => {
      let products;
        products = await storage.getProductsByCategory(userId, req.query.category as string);
        products = await storage.getProductsByUserId(userId);
      return res.json(products);
      console.error("Error fetching products:", error);
      return res.status(500).json({ message: "Failed to fetch products" });
  app.post("/api/products", async (req: Request, res: Response) => {
      const productData = insertProductSchema.parse({
      const product = await storage.createProduct(productData);
      return res.status(201).json(product);
      console.error("Error creating product:", error);
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      return res.status(500).json({ message: "Failed to create product" });
  app.get("/api/products/:id", async (req: Request, res: Response) => {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      // Ensure user can only access their own products
      return res.json(product);
      console.error("Error fetching product:", error);
      return res.status(500).json({ message: "Failed to fetch product" });
  app.put("/api/products/:id", async (req: Request, res: Response) => {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      // Ensure user can only update their own products
      const productData = insertProductSchema.partial().parse(req.body);
      delete productData.userId;
      const updatedProduct = await storage.updateProduct(productId, productData);
      return res.json(updatedProduct);
      console.error("Error updating product:", error);
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      return res.status(500).json({ message: "Failed to update product" });
  app.delete("/api/products/:id", async (req: Request, res: Response) => {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      // Ensure user can only delete their own products
      await storage.deleteProduct(productId);
      console.error("Error deleting product:", error);
      return res.status(500).json({ message: "Failed to delete product" });
  // Product Variants routes
  app.get("/api/products/:productId/variants", async (req: Request, res: Response) => {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      // Get the product to verify ownership
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      // Ensure user can only access variants of their own products
      const variants = await storage.getProductVariantsByProductId(productId);
      console.error("Error fetching product variants:", error);
      return res.status(500).json({ message: "Failed to fetch product variants" });
  app.post("/api/products/:productId/variants", async (req: Request, res: Response) => {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      // Ensure user can only add variants to their own products
        productId
      const newVariant = await storage.createProductVariant(variantData);
      // Update product to indicate it has variants
      if (!product.hasVariants) {
        await storage.updateProduct(productId, { hasVariants: true });
      console.error("Error creating product variant:", error);
      return res.status(500).json({ message: "Failed to create product variant" });
  app.put("/api/product-variants/:id", async (req: Request, res: Response) => {
      const variant = await storage.getProductVariant(variantId);
        return res.status(404).json({ message: "Product variant not found" });
      const product = await storage.getProduct(variant.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      // Ensure user can only update variants of their own products
      const updatedVariant = await storage.updateProductVariant(variantId, req.body);
      console.error("Error updating product variant:", error);
      return res.status(500).json({ message: "Failed to update product variant" });
  app.delete("/api/product-variants/:id", async (req: Request, res: Response) => {
      const variant = await storage.getProductVariant(variantId);
        return res.status(404).json({ message: "Product variant not found" });
      const product = await storage.getProduct(variant.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      // Ensure user can only delete variants of their own products
      await storage.deleteProductVariant(variantId);
      const remainingVariants = await storage.getProductVariantsByProductId(variant.productId);
      // If no variants are left, update the product to indicate it no longer has variants
        await storage.updateProduct(variant.productId, { hasVariants: false });
      console.error("Error deleting product variant:", error);
      return res.status(500).json({ message: "Failed to delete product variant" });
  // Shopping Cart routes
  app.get("/api/cart", async (req: Request, res: Response) => {
      let cart;
        // If user is logged in, get cart by user ID
        // If user is not logged in but has a guest ID, get cart by guest ID
        cart = await storage.getCartByGuestId(req.query.guestId as string);
        return res.status(400).json({ message: "Missing identifier for cart retrieval" });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      // Get cart items
      const cartItems = await storage.getCartItemsByCartId(cart.id);
        ...cart,
        items: cartItems
      console.error("Error fetching cart:", error);
      return res.status(500).json({ message: "Failed to fetch cart" });
  app.post("/api/cart", async (req: Request, res: Response) => {
      // Check if cart already exists
      let cart;
        cart = await storage.getCartByUserId(userId);
        cart = await storage.getCartByGuestId(guestId);
      // If cart already exists, return it
      if (cart) {
        const cartItems = await storage.getCartItemsByCartId(cart.id);
          ...cart,
          items: cartItems
      // Create new cart
      const newCart = await storage.createCart({
        ...newCart,
      console.error("Error creating cart:", error);
      return res.status(500).json({ message: "Failed to create cart" });
  app.post("/api/cart/items", async (req: Request, res: Response) => {
      const { cartId, productId, variantId, quantity } = req.body;
      if (!cartId || !productId || !quantity) {
        return res.status(400).json({ message: "Cart ID, product ID, and quantity are required" });
      // Fetch the cart to ensure it exists
      const cart = await storage.getCart(cartId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      // Check if the product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
        const variant = await storage.getProductVariant(variantId);
          return res.status(404).json({ message: "Product variant not found" });
        // Check if the variant belongs to the product
        if (variant.productId !== productId) {
          return res.status(400).json({ message: "Variant does not belong to the specified product" });
      // Get the price from the product or variant
      let price = product.price;
        const variant = await storage.getProductVariant(variantId);
          // The variant price is added to the base product price
          const basePrice = parseFloat(product.price);
      // Create cart item
      const cartItem = await storage.addCartItem({
        cartId,
        productId,
      // Update cart's status if needed
      await storage.updateCart(cartId, { status: 'active' });
      return res.status(201).json(cartItem);
      console.error("Error adding item to cart:", error);
      return res.status(500).json({ message: "Failed to add item to cart" });
  app.put("/api/cart/items/:id", async (req: Request, res: Response) => {
        return res.status(400).json({ message: "Invalid cart item ID" });
      // Get the cart item
      const cartItem = await storage.getCartItem(itemId);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      // Get the cart
      const cart = await storage.getCart(cartItem.cartId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      // Check if the authenticated user owns the cart
        return res.status(403).json({ message: "You do not have permission to update this cart item" });
      // Update the cart item with just the quantity
      const updatedCartItem = await storage.updateCartItem(itemId, {
      // Update cart status if needed
      await storage.updateCart(cartItem.cartId, { status: 'active' });
      return res.json(updatedCartItem);
      console.error("Error updating cart item:", error);
      return res.status(500).json({ message: "Failed to update cart item" });
  app.delete("/api/cart/items/:id", async (req: Request, res: Response) => {
        return res.status(400).json({ message: "Invalid cart item ID" });
      // Get the cart item
      const cartItem = await storage.getCartItem(itemId);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      // Get the cart
      const cart = await storage.getCart(cartItem.cartId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      // Check if the authenticated user owns the cart
        return res.status(403).json({ message: "You do not have permission to delete this cart item" });
      // Remove the cart item
      await storage.removeCartItem(itemId);
      // Update cart status if needed
      await storage.updateCart(cartItem.cartId, { status: 'active' });
      console.error("Error removing cart item:", error);
      return res.status(500).json({ message: "Failed to remove cart item" });

export default router;
