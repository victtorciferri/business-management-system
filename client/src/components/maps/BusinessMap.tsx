import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { User } from '@shared/schema';

// Default map container style
const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

interface BusinessMapProps {
  business: Omit<User, 'password'>;
}

export function BusinessMap({ business }: BusinessMapProps) {
  // Check if we have location data for the business
  const hasLocation = Boolean(
    business?.latitude && 
    business?.longitude && 
    business?.address
  );

  // Get coordinates from business data or use default coordinates
  const center = {
    lat: business?.latitude ? parseFloat(business.latitude) : -33.4372,
    lng: business?.longitude ? parseFloat(business.longitude) : -70.6506
  };

  // Load the Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''  // Use Vite environment variable
  });

  // Handle map load
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Format address for display
  const formatAddress = () => {
    const parts = [];
    if (business?.address) parts.push(business.address);
    if (business?.city) parts.push(business.city);
    
    let secondLine = [];
    if (business?.state) secondLine.push(business.state);
    if (business?.postalCode) secondLine.push(business.postalCode);
    
    const formattedAddress = [
      parts.join(', '),
      secondLine.join(' '),
      business?.country
    ].filter(Boolean).join('\n');
    
    return formattedAddress;
  };

  // Generate Google Maps directions URL
  const getDirectionsUrl = () => {
    let destination = '';
    
    if (business?.latitude && business?.longitude) {
      // If we have coordinates, use them
      destination = `${business.latitude},${business.longitude}`;
    } else if (business?.address) {
      // Otherwise use the address
      const addressParts = [];
      if (business.address) addressParts.push(business.address);
      if (business.city) addressParts.push(business.city);
      if (business.state) addressParts.push(business.state);
      if (business.country) addressParts.push(business.country);
      
      destination = encodeURIComponent(addressParts.join(', '));
    }
    
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  };

  // Handle open in Google Maps button click
  const handleOpenMaps = () => {
    window.open(getDirectionsUrl(), '_blank');
  };

  if (loadError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visit Us</CardTitle>
          <CardDescription>Our location and contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive mb-2">
            Unable to load map. Please try again later.
          </div>
          <div className="grid gap-4">
            <div>
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                Address
              </h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {formatAddress()}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 w-full" 
              onClick={handleOpenMaps}
            >
              <ExternalLink className="h-4 w-4" />
              Get Directions
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visit Us</CardTitle>
          <CardDescription>Our location and contact information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading map...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visit Us</CardTitle>
        <CardDescription>Our location and contact information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {hasLocation ? (
            <div className="relative w-full h-[300px] rounded-md overflow-hidden">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={15}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                  mapTypeControl: false,
                  streetViewControl: false,
                }}
              >
                <Marker position={center} />
              </GoogleMap>
            </div>
          ) : (
            <div className="bg-muted h-[300px] rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Map location not available</p>
            </div>
          )}

          <div>
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-primary" />
              Address
            </h3>
            <p className="text-muted-foreground whitespace-pre-line mb-4">
              {formatAddress()}
            </p>
            
            <Button 
              variant="default" 
              className="flex items-center gap-2 w-full" 
              onClick={handleOpenMaps}
            >
              <ExternalLink className="h-4 w-4" />
              Get Directions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}