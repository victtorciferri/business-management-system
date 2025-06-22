import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { extractBusinessSlug } from "@/utils/tenant-router";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Get the business slug from the current URL (path or subdomain)
 */
function getBusinessSlug(): string | null {
  // First try to get from URL path
  const pathSlug = extractBusinessSlug(window.location.pathname);
  if (pathSlug) {
    return pathSlug;
  }
  
  // Then try to get from subdomain
  const hostname = window.location.hostname;
  
  // Check if it's a subdomain pattern (e.g., appointease.cd, business.domain.com)
  if (hostname.includes('.') && !hostname.startsWith('www.')) {
    const parts = hostname.split('.');
    
    // For domains like appointease.cd, the first part is the business identifier
    if (parts.length >= 2) {
      const potentialSlug = parts[0];
      
      // Don't treat common subdomains as business slugs
      const commonSubdomains = ['www', 'api', 'admin', 'app', 'staging', 'dev', 'test'];
      if (!commonSubdomains.includes(potentialSlug)) {
        return potentialSlug;
      }
    }
  }
  
  return null;
}

/**
 * Build API URL with business slug if applicable
 */
function buildApiUrl(url: string): string {
  // EMERGENCY FIX: Completely disable business slug transformation
  // This should fix the production issue immediately
  console.log(`� EMERGENCY FIX: ${url} (transformation completely disabled - ${new Date().toISOString()})`);
  return url;
  
  // Original logic commented out for now:
  /*
  // If the URL already contains a business slug pattern, return as is
  if (url.includes('/api/') && !url.startsWith('/api/')) {
    return url;
  }
    // Global endpoints that should NOT have business slug applied
  const globalEndpoints = [
    '/api/login',
    '/api/logout',
    '/api/register',
    '/api/auth/',
    '/api/user',
    '/api/auth-debug',
    '/api/themes',
    '/api/current-business',
    '/api/staff/', // Staff endpoints should be global
    '/api/appointments', // Appointments endpoints should be global
    '/api/customers', // Customers endpoints should be global
    '/api/services' // Services endpoints should be global
  ];
  
  // Check if this is a global endpoint
  const isGlobalEndpoint = globalEndpoints.some(endpoint => 
    url.startsWith(endpoint) || url.includes(endpoint)
  );
  
  // Enhanced debug logging
  console.log(`🔍 buildApiUrl: ${url}`);
  console.log(`🔍 Is global endpoint:`, isGlobalEndpoint);
  console.log(`🔍 Matching endpoints:`, globalEndpoints.filter(endpoint => 
    url.startsWith(endpoint) || url.includes(endpoint)
  ));
  
  if (isGlobalEndpoint) {
    console.log(`🔍 Returning as global: ${url}`);
    return url;
  }
  
  const businessSlug = getBusinessSlug();
  
  // If no business slug or URL doesn't start with /api/, return as is
  if (!businessSlug || !url.startsWith('/api/')) {
    console.log(`🔍 No business slug or not API: ${url}`);
    return url;
  }
  
  // Replace /api/ with /{businessSlug}/api/
  const transformedUrl = url.replace('/api/', `/${businessSlug}/api/`);
  console.log(`🔍 Transformed: ${url} -> ${transformedUrl}`);
  return transformedUrl;
  */
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const finalUrl = buildApiUrl(url);
  
  // Basic debug logging
  console.log(`🔍 apiRequest: ${method} ${url} -> ${finalUrl}`);
  console.log(`🔍 Current path: ${window.location.pathname}`);
  console.log(`🔍 Current hostname: ${window.location.hostname}`);
  console.log(`🔍 Business slug: ${getBusinessSlug()}`);
  
  const res = await fetch(finalUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  console.log(`🔍 Response status: ${res.status} for ${finalUrl}`);
  
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const finalUrl = buildApiUrl(queryKey[0] as string);
    
    const res = await fetch(finalUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Test function for URL transformations - run in browser console
// @ts-ignore
window.testUrlTransformations = function() {
  console.log("🧪 Testing URL transformations...");
  
  const testUrls = [
    '/api/login',
    '/api/staff/3/availability',
    '/api/staff/3/appointments', 
    '/api/appointments',
    '/api/customers',
    '/api/services',
    '/api/user',
    '/api/themes'
  ];
  
  testUrls.forEach(url => {
    const result = buildApiUrl(url);
    console.log(`${url} -> ${result}`);
  });
  
  console.log(`Current hostname: ${window.location.hostname}`);
  console.log(`Business slug: ${getBusinessSlug()}`);
};

// Export for testing
// @ts-ignore
window.buildApiUrl = buildApiUrl;
// @ts-ignore  
window.getBusinessSlug = getBusinessSlug;

console.log("🧪 Test function available: testUrlTransformations()");
