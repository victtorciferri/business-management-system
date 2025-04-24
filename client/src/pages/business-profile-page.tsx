import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { BusinessLogo } from '@/components/business/BusinessLogo';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin, Save, X } from 'lucide-react';
import { AuthDebugger } from '@/components/debug/AuthDebugger';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import { BusinessMap } from '@/components/maps/BusinessMap';

// Location form schema
const locationSchema = z.object({
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

export default function BusinessProfilePage() {
  const { user, isLoading, refetchUser } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize form with user data
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      postalCode: user?.postalCode || '',
      country: user?.country || '',
      latitude: user?.latitude || '',
      longitude: user?.longitude || '',
    },
  });
  
  // Update form values when user data changes
  React.useEffect(() => {
    if (user) {
      form.reset({
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
        latitude: user.latitude || '',
        longitude: user.longitude || '',
      });
    }
  }, [user, form]);
  
  // Handle form submission
  const onSubmit = async (data: LocationFormValues) => {
    setIsSaving(true);
    try {
      console.log('Saving location data:', data);
      const response = await apiRequest('PATCH', '/api/business/location', data);

      if (!response) {
        throw new Error('Failed to update location');
      }

      // Refresh user data to get updated location
      await refetchUser();
      
      toast({
        title: 'Location updated',
        description: 'Your business location has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: 'Error',
        description: 'Failed to update location. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Check if business has location data
  const hasLocation = user ? Boolean(
    user.latitude && 
    user.longitude && 
    user.address
  ) : false;

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
        
        {/* Authentication Debugger - For troubleshooting purposes */}
        <AuthDebugger />
        
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
          
          {/* Business Location Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Business Location
              </CardTitle>
              <CardDescription>
                Set your business address and coordinates for Google Maps integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="San Francisco" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province</FormLabel>
                              <FormControl>
                                <Input placeholder="CA" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <Input placeholder="94103" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="USA" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator className="my-4" />
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Map Coordinates (Optional)</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          For precise map placement, enter latitude and longitude coordinates.
                          If left empty, Google Maps will try to locate your address automatically.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="latitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitude</FormLabel>
                              <FormControl>
                                <Input placeholder="37.7749" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="longitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitude</FormLabel>
                              <FormControl>
                                <Input placeholder="-122.4194" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button 
                          type="reset" 
                          variant="outline"
                          onClick={() => form.reset()}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isSaving ? 'Saving...' : 'Save Location'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
                
                <div>
                  <div className="bg-muted/30 rounded-md flex flex-col items-center justify-center min-h-[250px] h-full">
                    {hasLocation ? (
                      user && <BusinessMap business={user} />
                    ) : (
                      <div className="p-6 flex flex-col items-center justify-center">
                        <MapPin className="h-12 w-12 text-muted mb-4" />
                        <p className="text-muted-foreground text-center">
                          No location information yet. Fill in your address details to see a preview.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Alert className="mt-4">
                    <MapPin className="h-4 w-4" />
                    <AlertTitle>Google Maps Integration</AlertTitle>
                    <AlertDescription>
                      Your business location will appear on your customer portal with a Google Map.
                      Customers can easily get directions to your business.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}