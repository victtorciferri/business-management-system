import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { User, Service } from '@shared/schema';
import { getQueryFn } from '@/lib/queryClient';
import BusinessPortal from './business-portal';
import NotFound from './not-found';
import { Shield, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/header';

interface PreviewBusinessProps {
  userId: number;
}

const PreviewBusiness = ({ userId }: PreviewBusinessProps) => {
  const [, setLocation] = useLocation();
  const [isAdmin, setIsAdmin] = useState(true); // In a real app, this would come from auth state
  
  // Fetch business preview data
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/preview-business/${userId}`],
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: false,
  });
  
  // If not admin, show access denied page
  if (!isAdmin) {
    return (
      <Layout currentUser={null}>
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto px-4">
            <ShieldAlert className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="text-3xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this preview. Only administrators and business owners can view this page.
            </p>
            <Button onClick={() => setLocation('/')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Handle loading state
  if (isLoading) {
    return (
      <Layout currentUser={null}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }
  
  // Handle error state
  if (error || !data) {
    return (
      <Layout currentUser={null}>
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto px-4">
            <ShieldAlert className="h-16 w-16 text-amber-500 mx-auto" />
            <h1 className="text-3xl font-bold">Preview Not Available</h1>
            <p className="text-muted-foreground">
              {error instanceof Error 
                ? error.message 
                : "We couldn't load the business preview. The business might not exist or you don't have permission to view it."}
            </p>
            <Button onClick={() => setLocation('/')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If we have business data, render the business portal with preview banner
  return (
    <>
      {/* Preview Banner */}
      <div className="sticky top-0 z-50 w-full bg-amber-500 text-black py-2 px-4 text-center shadow-md">
        <div className="flex items-center justify-center gap-1.5">
          <Shield className="h-5 w-5" />
          <span className="font-semibold">Preview Mode</span>
          <span className="mx-2">-</span>
          <span>You're viewing how this business page will appear to customers.</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation('/')}
            className="ml-4 bg-white hover:bg-gray-100 text-black border-black"
          >
            Exit Preview
          </Button>
        </div>
      </div>
      
      {/* Render Business Portal */}
      <BusinessPortal 
        slug={data.business.businessSlug || 'preview'} 
        initialData={{
          business: data.business,
          services: data.services,
          isPreview: true
        }}
      />
    </>
  );
};

export default function PreviewBusinessWrapper() {
  // Extract business ID from URL
  const [location] = useLocation();
  const match = location.match(/\/preview\/(\d+)/);
  const businessId = match ? parseInt(match[1]) : 0;
  
  if (!businessId) {
    return <NotFound />;
  }
  
  return <PreviewBusiness userId={businessId} />;
}