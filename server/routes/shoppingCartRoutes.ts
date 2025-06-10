import express, { Request, Response } from "express";
import { storage } from "../storage";
import crypto from "crypto";

const router = express.Router();

// Root route - provide API information
router.get("/", async (req: Request, res: Response) => {
    try {
        let cart;
        if (req.session?.user) {
            cart = await storage.getCartByUserId(req.session.user.id);
        } else if (req.query.guestId) {
            cart = await storage.getCartByGuestId(req.query.guestId as string);
        } else if (req.query.customerId) {
            cart = await storage.getCartByCustomerId(parseInt(req.query.customerId as string));
        } else {
            // If no identifier provided, return API info instead of error
            return res.json({
                message: "Shopping Cart API",
                endpoints: {
                    "GET /api/cart?customerId=:id": "Get cart by customer ID",
                    "GET /api/cart?guestId=:id": "Get cart by guest ID", 
                    "POST /api/cart": "Create new cart",
                    "POST /api/cart/items": "Add item to cart",
                    "PUT /api/cart/items/:id": "Update cart item",
                    "DELETE /api/cart/items/:id": "Remove cart item"
                },
                note: "Cart requires customerId, guestId, or authenticated session"
            });
        }

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const cartItems = await storage.getCartItemsByCartId(cart.id);
        return res.json({
            ...cart,
            items: cartItems
        });
    } catch (error) {
        console.error("Error fetching cart:", error);
        return res.status(500).json({ message: "Failed to fetch cart" });
    }
});

// POST /api/cart
router.post("/", async (req: Request, res: Response) => {
    try {
        let userId = null;
        let customerId = null;
        let guestId = null;

        if (req.session?.user) {
            userId = req.session.user.id;
        } else if (req.body.customerId) {
            customerId = parseInt(req.body.customerId);
        } else if (req.body.guestId) {
            guestId = req.body.guestId;
        } else {
            guestId = crypto.randomUUID();
        }

        let cart;
        if (userId) {
            cart = await storage.getCartByUserId(userId);
        } else if (customerId) {
            cart = await storage.getCartByCustomerId(customerId);
        } else if (guestId) {
            cart = await storage.getCartByGuestId(guestId);
        }

        if (cart) {
            const cartItems = await storage.getCartItemsByCartId(cart.id);
            return res.json({ ...cart, items: cartItems });
        }

        const newCart = await storage.createCart({
            userId,
            customerId,
            guestId,
            status: 'active'
        });

        return res.status(201).json({ ...newCart, items: [] });
    } catch (error) {
        console.error("Error creating cart:", error);
        return res.status(500).json({ message: "Failed to create cart" });
    }
});

// POST /api/cart/items
router.post("/items", async (req: Request, res: Response) => {
    try {
        const { cartId, productId, variantId, quantity } = req.body;
        if (!cartId || !productId || !quantity) {
            return res.status(400).json({ message: "Cart ID, product ID, and quantity are required" });
        }
        const cart = await storage.getCart(cartId);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        const product = await storage.getProduct(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (variantId) {
            const variant = await storage.getProductVariant(variantId);
            if (!variant) {
                return res.status(404).json({ message: "Product variant not found" });
            }
            if (variant.productId !== productId) {
                return res.status(400).json({ message: "Variant does not belong to the specified product" });
            }
        }

        let price = product.price;
        if (variantId) {
            const variant = await storage.getProductVariant(variantId);
            if (variant && variant.additionalPrice) {
                const basePrice = parseFloat(product.price);
                const additionalPrice = parseFloat(variant.additionalPrice);
                price = (basePrice + additionalPrice).toString();
            }
        }

        const cartItem = await storage.addCartItem({
            cartId,
            productId,
            variantId,
            quantity,
            price
        });

        await storage.updateCart(cartId, { status: 'active' });
        return res.status(201).json(cartItem);
    } catch (error) {
        console.error("Error adding item to cart:", error);
        return res.status(500).json({ message: "Failed to add item to cart" });
    }
});

// PUT /api/cart/items/:id
router.put("/items/:id", async (req: Request, res: Response) => {
    try {
        const itemId = parseInt(req.params.id);
        const { quantity } = req.body;
        if (isNaN(itemId)) {
            return res.status(400).json({ message: "Invalid cart item ID" });
        }
        if (quantity === undefined) {
            return res.status(400).json({ message: "Quantity is required" });
        }
        const cartItem = await storage.getCartItem(itemId);
        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }
        const cart = await storage.getCart(cartItem.cartId);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        if (req.session?.user && cart.userId && cart.userId !== req.session.user.id) {
            return res.status(403).json({ message: "You do not have permission to update this cart item" });
        }
        const updatedCartItem = await storage.updateCartItem(itemId, { quantity });
        await storage.updateCart(cartItem.cartId, { status: 'active' });
        return res.json(updatedCartItem);
    } catch (error) {
        console.error("Error updating cart item:", error);
        return res.status(500).json({ message: "Failed to update cart item" });
    }
});

// DELETE /api/cart/items/:id
router.delete("/items/:id", async (req: Request, res: Response) => {
    try {
        const itemId = parseInt(req.params.id);
        if (isNaN(itemId)) {
            return res.status(400).json({ message: "Invalid cart item ID" });
        }
        const cartItem = await storage.getCartItem(itemId);
        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }
        const cart = await storage.getCart(cartItem.cartId);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        if (req.session?.user && cart.userId && cart.userId !== req.session.user.id) {
            return res.status(403).json({ message: "You do not have permission to delete this cart item" });
        }
        await storage.removeCartItem(itemId);
        await storage.updateCart(cartItem.cartId, { status: 'active' });
        return res.status(204).end();
    } catch (error) {
        console.error("Error removing cart item:", error);
        return res.status(500).json({ message: "Failed to remove cart item" });
    }
});

export default router;