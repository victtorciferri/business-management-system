import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { BusinessLogo } from '@/components/business/BusinessLogo';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function BusinessProfilePage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          Please log in to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Business Profile Settings</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Business Logo Card */}
          <Card>
            <CardHeader>
              <CardTitle>Business Logo</CardTitle>
              <CardDescription>
                Upload or change your business logo. This logo will appear on your business page and customer portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pt-4">
              <BusinessLogo
                business={user}
                size="large"
                aspectRatio="square"
                showLabel={true}
              />
            </CardContent>
          </Card>
          
          {/* Business Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Your business details as shown to customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-medium text-sm">Business Name</h3>
                <p className="text-muted-foreground">{user.businessName || 'Not set'}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-medium text-sm">Contact Email</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-medium text-sm">Contact Phone</h3>
                <p className="text-muted-foreground">{user.phone || 'Not set'}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-medium text-sm">Business URL</h3>
                <p className="text-muted-foreground">
                  {user.businessSlug ? 
                    <a 
                      href={`/${user.businessSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      /{user.businessSlug}
                    </a> : 
                    'Not set'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}