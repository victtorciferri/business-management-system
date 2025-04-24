import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { Container } from '@/components/ui/layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Save, X } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BusinessMap } from '@/components/maps/BusinessMap';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

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

export default function BusinessLocationPage() {
  const { business, refreshBusinessData } = useBusinessContext();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      address: business?.address || '',
      city: business?.city || '',
      state: business?.state || '',
      postalCode: business?.postalCode || '',
      country: business?.country || '',
      latitude: business?.latitude || '',
      longitude: business?.longitude || '',
    },
  });

  // Update form when business data changes
  useEffect(() => {
    if (business) {
      form.reset({
        address: business.address || '',
        city: business.city || '',
        state: business.state || '',
        postalCode: business.postalCode || '',
        country: business.country || '',
        latitude: business.latitude || '',
        longitude: business.longitude || '',
      });
    }
  }, [business, form]);

  const onSubmit = async (data: LocationFormValues) => {
    setIsSaving(true);
    try {
      console.log('Saving location data:', data);
      const response = await apiRequest('PATCH', '/api/business/location', data);

      if (!response) {
        throw new Error('Failed to update location');
      }

      await refreshBusinessData();
      
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

  const hasLocation = Boolean(
    business?.latitude && 
    business?.longitude && 
    business?.address
  );

  return (
    <ProtectedRoute>
      <Container className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/settings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Business Location</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Location Information
                </CardTitle>
                <CardDescription>
                  Set your business address and coordinates for the map
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Map Preview</CardTitle>
                <CardDescription>
                  This is how your business location will appear to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasLocation && business ? (
                  <BusinessMap business={business} />
                ) : (
                  <div className="bg-muted/30 rounded-md p-6 flex flex-col items-center justify-center min-h-[250px]">
                    <MapPin className="h-12 w-12 text-muted mb-4" />
                    <p className="text-muted-foreground text-center">
                      No location information yet. Fill in your address details to see a preview.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertTitle>Google Maps Integration</AlertTitle>
              <AlertDescription>
                Your business location will appear on your customer portal with a Google Map.
                Customers can easily get directions to your business.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </Container>
    </ProtectedRoute>
  );
}