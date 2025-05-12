import express, { Request, Response } from "express";
import { storage } from "../storage";
import { insertProductSchema, insertProductVariantSchema } from "@shared/schema";
import { z } from "zod";

const router = express.Router();

/*********************************
 * Product Routes
 *********************************/

// GET /api/products
router.get("/", async (req: Request, res: Response) => {
    try {
        if (!req.session?.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const userId = req.session.user.id;
        let products;
        if (req.query.category) {
            products = await storage.getProductsByCategory(userId, req.query.category as string);
        } else {
            products = await storage.getProductsByUserId(userId);
        }
        return res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Failed to fetch products" });
    }
});

// POST /api/products
router.post("/", async (req: Request, res: Response) => {
    try {
        if (!req.session?.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const userId = req.session.user.id;
        const productData = insertProductSchema.parse({ ...req.body, userId });
        const product = await storage.createProduct(productData);
        return res.status(201).json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid product data", errors: error.errors });
        }
        return res.status(500).json({ message: "Failed to create product" });
    }
});

// GET /api/products/:id
router.get("/:id", async (req: Request, res: Response) => {
    try {
        if (!req.session?.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        const product = await storage.getProduct(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.userId !== req.session.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }
        return res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ message: "Failed to fetch product" });
    }
});

// PUT /api/products/:id
router.put("/:id", async (req: Request, res: Response) => {
    try {
        if (!req.session?.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        const product = await storage.getProduct(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.userId !== req.session.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }
        const productData = insertProductSchema.partial().parse(req.body);
        delete productData.userId;
        const updatedProduct = await storage.updateProduct(productId, productData);
        return res.json(updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid product data", errors: error.errors });
        }
        return res.status(500).json({ message: "Failed to update product" });
    }
});

// DELETE /api/products/:id
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        if (!req.session?.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        const product = await storage.getProduct(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.userId !== req.session.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }
        await storage.deleteProduct(productId);
        return res.status(204).end();
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Failed to delete product" });
    }
});

/*********************************
 * Product Variant Routes
 *********************************/

// GET /api/products/:productId/variants
router.get("/:productId/variants", async (req: Request, res: Response) => {
    try {
        if (!req.session?.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const productId = parseInt(req.params.productId);
        if (isNaN(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        const product = await storage.getProduct(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.userId !== req.session.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }
        const variants = await storage.getProductVariantsByProductId(productId);
        return res.json(variants);
    } catch (error) {
        console.error("Error fetching product variants:", error);
        return res.status(500).json({ message: "Failed to fetch product variants" });
    }
});

// POST /api/products/:productId/variants
router.post("/:productId/variants", async (req: Request, res: Response) => {
    try {
        if (!req.session?.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const productId = parseInt(req.params.productId);
        if (isNaN(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        const product = await storage.getProduct(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.userId !== req.session.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }
        const variantData = { ...req.body, productId };
        const newVariant = await storage.createProductVariant(variantData);
        if (!product.hasVariants) {
            await storage.updateProduct(productId, { hasVariants: true });
        }
        return res.status(201).json(newVariant);
    } catch (error) {
        console.error("Error creating product variant:", error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid variant data", errors: error.errors });
        }
        return res.status(500).json({ message: "Failed to create product variant" });
    }
});

// PUT /api/product-variants/:id
router.put("/variants/:id", async (req: Request, res: Response) => {
    try {
        if (!req.session?.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const variantId = parseInt(req.params.id);
        if (isNaN(variantId)) {
            return res.status(400).json({ message: "Invalid variant ID" });
        }
        const variant = await storage.getProductVariant(variantId);
        if (!variant) {
            return res.status(404).json({ message: "Product variant not found" });
        }
        const product = await storage.getProduct(variant.productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.userId !== req.session.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }
        const updatedVariant = await storage.updateProductVariant(variantId, req.body);
        return res.json(updatedVariant);
    } catch (error) {
        console.error("Error updating product variant:", error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid variant data", errors: error.errors });
        }
        return res.status(500).json({ message: "Failed to update product variant" });
    }
});

// DELETE /api/product-variants/:id
router.delete("/variants/:id", async (req: Request, res: Response) => {
    try {
        if (!req.session?.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const variantId = parseInt(req.params.id);
        if (isNaN(variantId)) {
            return res.status(400).json({ message: "Invalid variant ID" });
        }
        const variant = await storage.getProductVariant(variantId);
        if (!variant) {
            return res.status(404).json({ message: "Product variant not found" });
        }
        const product = await storage.getProduct(variant.productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.userId !== req.session.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }
        await storage.deleteProductVariant(variantId);
        const remainingVariants = await storage.getProductVariantsByProductId(variant.productId);
        if (remainingVariants.length === 0) {
            await storage.updateProduct(variant.productId, { hasVariants: false });
        }
        return res.status(204).end();
    } catch (error) {
        console.error("Error deleting product variant:", error);
        return res.status(500).json({ message: "Failed to delete product variant" });
    }
});

export default router;