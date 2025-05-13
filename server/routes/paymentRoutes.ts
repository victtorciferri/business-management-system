import express, { Request, Response } from "express";
import { storage } from "../storage";
import { sql } from "drizzle-orm";
import { createPreference, processWebhook } from "../mercadopago";
import Stripe from "stripe";

// Initialize Stripe if secret key is available
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-03-31.basil",
    })
  : undefined;

const router = express.Router();

/*********************************
 * Payment Intent Creation
 *********************************/
// POST /api/create-payment-intent
router.post("/create-payment-intent", async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }
    const appointment = await storage.getAppointment(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    const service = await storage.getService(appointment.serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    const business = await storage.getUser(appointment.userId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    const customer = await storage.getCustomer(appointment.customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Calculate fee amounts
    const platformFeePercentage = parseFloat(business.platformFeePercentage?.toString() || "2.00");
    const amount = parseFloat(service.price.toString());
    const platformFeeAmount = (amount * platformFeePercentage) / 100;
    const businessAmount = amount - platformFeeAmount;

    // Use mock payment if no MercadoPago access token is configured
    if (!business.mercadopagoAccessToken) {
      const mockClientSecret = `mp_test_${Date.now()}_${appointmentId}`;
      const mockPreferenceId = `pref_${Date.now()}`;
      await storage.createPayment({
        appointmentId: appointment.id,
        amount: service.price,
        status: "pending",
        paymentProcessor: "mercadopago",
        processorPaymentId: mockClientSecret,
        merchantAccountId: business.mercadopagoAccountId || null,
        platformFeePercentage: platformFeePercentage.toString(),
        platformFeeAmount: platformFeeAmount.toString(),
        businessAmount: businessAmount.toString(),
        preferenceId: mockPreferenceId,
      });
      return res.json({
        clientSecret: mockClientSecret,
        paymentUrl: `/payment/mock?appointmentId=${appointmentId}`,
        preferenceId: mockPreferenceId,
        isMockPayment: true
      });
    }

    // Real MercadoPago integration
    const preferenceResult = await createPreference(business, service, customer, appointment);
    if (!preferenceResult) {
      throw new Error("Failed to create MercadoPago preference");
    }
    await storage.createPayment({
      appointmentId: appointment.id,
      amount: service.price,
      status: "pending",
      paymentProcessor: "mercadopago",
      processorPaymentId: preferenceResult.preference.id,
      merchantAccountId: business.mercadopagoAccountId || null,
      platformFeePercentage: platformFeePercentage.toString(),
      platformFeeAmount: preferenceResult.platformFeeAmount.toString(),
      businessAmount: preferenceResult.businessAmount.toString(),
      preferenceId: preferenceResult.preference.id,
      paymentUrl: preferenceResult.preference.init_point,
      metadata: JSON.stringify({
        externalReference: preferenceResult.externalReference
      })
    });
    res.json({
      clientSecret: preferenceResult.preference.id,
      paymentUrl: preferenceResult.preference.init_point,
      preferenceId: preferenceResult.preference.id,
      isMockPayment: false
    });
  } catch (error: any) {
    console.error("Payment processing error:", error);
    res.status(500).json({ message: "Payment processing failed", error: error.message });
  }
});

/*********************************
 * Confirm Payment Endpoint
 *********************************/
// POST /api/confirm-payment
router.post("/confirm-payment", async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, appointmentId } = req.body;
    if (!paymentIntentId || !appointmentId) {
      return res.status(400).json({ message: "Payment Intent ID and Appointment ID are required" });
    }
    const appointment = await storage.updateAppointment(parseInt(appointmentId, 10), {
      paymentStatus: "paid",
    });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    const payments = await storage.getPaymentsByAppointmentId(parseInt(appointmentId, 10));
    if (payments.length > 0) {
      const payment = payments[0];
      await storage.updatePayment(payment.id, { status: "completed" });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to confirm payment", error: error.message });
  }
});

/*********************************
 * MercadoPago Webhook Handler
 *********************************/
// POST /api/webhooks/mercadopago
router.post("/webhooks/mercadopago", async (req: Request, res: Response) => {
  try {
    const data = req.body;
    console.log("Received MercadoPago webhook:", JSON.stringify(data));
    const result = await processWebhook(data);
    if (!result) {
      return res.status(200).end();
    }
    // Assume external reference format: app_APPOINTMENTID_TIMESTAMP
    const externalRefParts = result.externalReference.split('_');
    if (externalRefParts.length < 2) {
      return res.status(400).json({ message: "Invalid external reference format" });
    }
    const appointmentId = parseInt(externalRefParts[1]);
    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID in external reference" });
    }
    const appointment = await storage.getAppointment(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (result.status === "approved") {
      await storage.updateAppointment(appointmentId, { paymentStatus: "paid" });
      const payments = await storage.getPaymentsByAppointmentId(appointmentId);
      if (payments.length > 0) {
        const payment = payments[0];
        await storage.updatePayment(payment.id, {
          status: "completed",
          processorPaymentId: result.paymentId.toString()
        });
      }
    }
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error processing MercadoPago webhook:", error);
    res.status(500).json({ message: "Failed to process webhook", error: error.message });
  }
});

export default router;