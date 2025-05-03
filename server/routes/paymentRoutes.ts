import { Router } from "express";
const router = Router();

import { createPreference, processWebhook } from './mercadopago';
  insertPaymentSchema,
import Stripe from "stripe";
// Initialize Stripe if secret key is available
let stripe: Stripe | undefined;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Using MercadoPago helpers imported at the top of the file
  // Payment routes
  app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
        // Create a MercadoPago preference with payment details
        // Check if business has MercadoPago configured
          // No MercadoPago integration, use mock for development
          console.log("MercadoPago not configured for business, using mock payment flow");
          // Create a payment record
          await storage.createPayment({
            paymentProcessor: "mercadopago",
            processorPaymentId: mockClientSecret,
            merchantAccountId: business.mercadopagoAccountId || null,
            isMockPayment: true
        // Using real MercadoPago integration
          throw new Error("Failed to create MercadoPago preference");
        // Save payment information with marketplace split details
        await storage.createPayment({
          paymentProcessor: "mercadopago",
          processorPaymentId: preferenceResult.preference.id,
          merchantAccountId: business.mercadopagoAccountId || null,
          paymentUrl: preferenceResult.preference.init_point,
        // Return client secret and payment URL for the frontend
          paymentUrl: preferenceResult.preference.init_point,
          isMockPayment: false
        console.error("MercadoPago error:", mpError);
        return res.status(500).json({ message: "Payment processing failed: " + mpError.message });
      console.error("Payment processing error:", error);
      res.status(500).json({ message: "Payment processing failed" });
  app.post("/api/confirm-payment", async (req: Request, res: Response) => {
        paymentStatus: "paid",
      // Find and update payment record
      if (payments.length > 0) {
        const payment = payments[0];
        await storage.updatePayment(payment.id, {
      res.status(500).json({ message: "Failed to confirm payment" });
  // MercadoPago webhook handler
  app.post("/api/webhooks/mercadopago", async (req: Request, res: Response) => {
      console.log("Received MercadoPago webhook:", JSON.stringify(data));
        return res.status(200).end(); // Acknowledge receipt even if not a payment notification
          paymentStatus: "paid",
        // Update payment record
        if (payments.length > 0) {
          const payment = payments[0];
          await storage.updatePayment(payment.id, {
            processorPaymentId: result.paymentId.toString()
      console.error("Error processing MercadoPago webhook:", error);
  app.get("/api/admin/payments", requireAdmin, async (req: Request, res: Response) => {
      const paymentsArrays = await Promise.all(paymentsPromises);
      const allPayments = paymentsArrays.flat();
      res.json(allPayments);
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });

export default router;
