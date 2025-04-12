import { User, Service, Customer, Appointment } from '@shared/schema';
import MercadoPagoConfig from 'mercadopago';

// This is to work around TypeScript types for MercadoPago
const mercadopago = MercadoPagoConfig as any;

interface MercadoPagoPaymentPreference {
  id: string;
  init_point: string;
  external_reference: string;
  [key: string]: any;
}

interface MercadoPagoResponse {
  body: MercadoPagoPaymentPreference;
  [key: string]: any;
}

interface PreferenceResult {
  preference: MercadoPagoPaymentPreference;
  externalReference: string;
  platformFeeAmount: number;
  businessAmount: number;
}

interface WebhookResult {
  paymentId: string;
  externalReference: string;
  status: string;
}

/**
 * Initialize MercadoPago configuration with business credentials
 */
export function initMercadoPago(business: User): void {
  if (!business.mercadopagoAccessToken) {
    throw new Error('MercadoPago access token is not configured for this business');
  }

  // Configure MercadoPago with business access token
  mercadopago.configure({
    access_token: business.mercadopagoAccessToken
  });
}

/**
 * Create a MercadoPago preference with split payments between platform and business
 */
export async function createPreference(
  business: User,
  service: Service,
  customer: Customer,
  appointment: Appointment
): Promise<PreferenceResult> {
  // Initialize MercadoPago
  initMercadoPago(business);

  // Calculate platform fee
  const platformFeePercentage = parseFloat(business.platformFeePercentage?.toString() || "2.00");
  const amount = parseFloat(service.price.toString());
  const platformFeeAmount = (amount * platformFeePercentage) / 100;
  const businessAmount = amount - platformFeeAmount;

  // Create a unique external reference
  const externalReference = `app_${appointment.id}_${Date.now()}`;

  // Build the notification URL
  const baseUrl = process.env.BASE_URL || `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  const notificationUrl = `${baseUrl}/api/webhooks/mercadopago`;

  // Create the MercadoPago preference with marketplace fee
  const preference = {
    items: [
      {
        id: appointment.id.toString(),
        title: service.name,
        description: `Appointment for ${service.name} - ${new Date(appointment.date).toLocaleString()}`,
        unit_price: parseFloat(service.price.toString()),
        quantity: 1,
        currency_id: "USD" // Can be configured per business
      }
    ],
    payer: {
      name: customer.firstName,
      surname: customer.lastName,
      email: customer.email,
      phone: {
        number: customer.phone
      }
    },
    marketplace_fee: platformFeeAmount,
    external_reference: externalReference,
    back_urls: {
      success: `${baseUrl}/payment/success?appointmentId=${appointment.id}`,
      failure: `${baseUrl}/payment/failure?appointmentId=${appointment.id}`,
      pending: `${baseUrl}/payment/pending?appointmentId=${appointment.id}`
    },
    auto_return: "approved",
    notification_url: notificationUrl,
    metadata: {
      appointmentId: appointment.id,
      businessId: business.id,
      serviceId: service.id,
      customerId: customer.id,
      platformFeePercentage,
      platformFeeAmount,
      businessAmount
    }
  };

  try {
    const response = await mercadopago.preferences.create(preference) as MercadoPagoResponse;
    return {
      preference: response.body,
      externalReference,
      platformFeeAmount,
      businessAmount
    };
  } catch (error: any) {
    console.error('Error creating MercadoPago preference:', error);
    throw new Error('Failed to create payment preference: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Process a MercadoPago webhook notification
 */
export async function processWebhook(data: any): Promise<WebhookResult | null> {
  if (data.type === 'payment') {
    const paymentId = data.data.id;
    
    try {
      // Get payment details
      const payment = await mercadopago.payment.findById(paymentId) as MercadoPagoResponse;
      const status = payment.body.status;
      const externalReference = payment.body.external_reference;
      
      return {
        paymentId,
        externalReference,
        status
      };
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      throw new Error('Failed to process payment webhook: ' + (error.message || 'Unknown error'));
    }
  }
  
  return null;
}