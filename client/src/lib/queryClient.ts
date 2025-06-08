import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { extractBusinessSlug } from "@/utils/tenant-router";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Get the business slug from the current URL path
 */
function getBusinessSlugFromPath(): string | null {
  return extractBusinessSlug(window.location.pathname);
}

/**
 * Build API URL with business slug if applicable
 */
function buildApiUrl(url: string): string {
  // If the URL already contains a business slug pattern, return as is
  if (url.includes('/api/') && !url.startsWith('/api/')) {
    return url;
  }
  
  const businessSlug = getBusinessSlugFromPath();
  
  // If no business slug or URL doesn't start with /api/, return as is
  if (!businessSlug || !url.startsWith('/api/')) {
    return url;
  }
  
  // Replace /api/ with /{businessSlug}/api/
  return url.replace('/api/', `/${businessSlug}/api/`);
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const finalUrl = buildApiUrl(url);
  
  const res = await fetch(finalUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

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
