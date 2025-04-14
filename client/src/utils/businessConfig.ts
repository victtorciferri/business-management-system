import { Business, Service } from '@/contexts/BusinessContext';

export interface BusinessConfig {
  // Basic business information
  id: number;
  name: string | null;
  slug: string | null;
  email: string;
  phone: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  description?: string | null;
  
  // Media and branding
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  
  // Theme settings
  themeSettings: {
    primaryColor: string; // Main brand color
    secondaryColor: string; // Secondary color
    accentColor: string; // Accent color for highlights
    textColor: string; // Main text color
    backgroundColor: string; // Background color
    fontFamily: string; // Font family
    borderRadius: string; // Border radius style
    buttonStyle: "rounded" | "square" | "pill"; // Button style
    cardStyle: "elevated" | "flat" | "bordered"; // Card style
  };
  
  // Services
  services: Service[] | null;
  
  // Localization
  locale: string; // e.g., 'en', 'es', 'pt'
  timeZone: string; // e.g., 'America/Santiago'
  currencyCode: string; // e.g., 'USD', 'CLP'
  currencySymbol: string; // e.g., '$', '€'
  
  // Business hours format
  use24HourFormat: boolean;
  
  // Business operational settings
  appointmentBuffer: number; // Buffer time between appointments in minutes
  allowSameTimeSlotForDifferentServices: boolean;
  cancellationWindowHours: number; // Hours before which cancellation is allowed
}

/**
 * Get default business configuration
 */
function getDefaultBusinessConfig(): BusinessConfig {
  return {
    id: 0,
    name: null,
    slug: null,
    email: "",
    phone: null,
    themeSettings: {
      primaryColor: "indigo-600",
      secondaryColor: "gray-200",
      accentColor: "amber-500",
      textColor: "gray-800",
      backgroundColor: "white",
      fontFamily: "sans-serif",
      borderRadius: "rounded-md",
      buttonStyle: "rounded",
      cardStyle: "elevated",
    },
    services: null,
    locale: "en",
    timeZone: "America/Santiago",
    currencyCode: "USD",
    currencySymbol: "$",
    use24HourFormat: false,
    appointmentBuffer: 15,
    allowSameTimeSlotForDifferentServices: false,
    cancellationWindowHours: 24,
  };
}

/**
 * Get business configuration based on business data
 * Merges default configuration with business-specific settings
 * 
 * @param business Business data from API or context
 * @param services Services associated with the business
 * @returns BusinessConfig object with merged settings
 */
export function getBusinessConfig(
  business: Business | null,
  services: Service[] | null = null
): BusinessConfig {
  // Start with default config
  const defaultConfig = getDefaultBusinessConfig();
  
  // If no business data, return default config
  if (!business) {
    return defaultConfig;
  }
  
  // Extract theme settings from business if available
  const themeSettings = business.themeSettings 
    ? { ...defaultConfig.themeSettings, ...business.themeSettings }
    : defaultConfig.themeSettings;
    
  // Build the business configuration
  return {
    id: business.id,
    name: business.businessName,
    slug: business.businessSlug,
    email: business.email,
    phone: business.phone,
    address: business.address,
    city: business.city,
    state: business.state,
    postalCode: business.postalCode,
    country: business.country,
    latitude: business.latitude,
    longitude: business.longitude,
    description: business.description,
    logoUrl: business.logoUrl,
    coverImageUrl: business.coverImageUrl,
    themeSettings,
    services: services || null,
    
    // Set locale based on business preferences or default
    locale: business.locale || defaultConfig.locale,
    timeZone: business.businessTimeZone || defaultConfig.timeZone,
    currencyCode: business.currencyCode || defaultConfig.currencyCode,
    currencySymbol: business.currencySymbol || defaultConfig.currencySymbol,
    
    // Business operational settings from business or defaults
    use24HourFormat: business.use24HourFormat || defaultConfig.use24HourFormat,
    appointmentBuffer: business.appointmentBuffer || defaultConfig.appointmentBuffer,
    allowSameTimeSlotForDifferentServices: business.allowSameTimeSlotForDifferentServices || 
      defaultConfig.allowSameTimeSlotForDifferentServices,
    cancellationWindowHours: business.cancellationWindowHours || defaultConfig.cancellationWindowHours,
  };
}

/**
 * Format currency based on business configuration
 * 
 * @param amount Amount to format
 * @param config Business configuration
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, config: BusinessConfig): string {
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currencyCode,
    currencyDisplay: 'symbol',
  }).format(amount);
}

/**
 * Format date based on business configuration
 * 
 * @param date Date to format
 * @param config Business configuration
 * @param options Optional Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date, 
  config: BusinessConfig,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat(
    config.locale,
    options || defaultOptions
  ).format(date);
}

/**
 * Format time based on business configuration
 * 
 * @param date Date object containing the time to format
 * @param config Business configuration
 * @returns Formatted time string
 */
export function formatTime(date: Date, config: BusinessConfig): string {
  return new Intl.DateTimeFormat(
    config.locale,
    {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !config.use24HourFormat,
    }
  ).format(date);
}