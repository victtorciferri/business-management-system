import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, ExternalLink, Loader2, Navigation } from 'lucide-react';
import { User } from '@shared/schema';
import { cn } from '@/lib/utils';

// Default map container style
const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

interface BusinessMapProps {
  business: Omit<User, 'password'>;
  className?: string;
  compact?: boolean;
}

export function BusinessMap({ business, className, compact = false }: BusinessMapProps) {
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  
  // Check if business has an address
  const hasAddress = Boolean(
    business?.address &&
    business?.city
  );
  
  // Check if we have precise coordinates for the business
  const hasCoordinates = Boolean(
    business?.latitude && 
    business?.longitude
  );
  
  // If we have coordinates, use them. Otherwise, we'll estimate from the address via geocoding
  const center = hasCoordinates ? {
    lat: parseFloat(business.latitude as string),
    lng: parseFloat(business.longitude as string)
  } : undefined;

  // Load the Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''  // Use Vite environment variable
  });

  useEffect(() => {
    if (loadError) {
      setStatus('error');
    } else if (isLoaded) {
      setStatus('ready');
    } else {
      setStatus('loading');
    }
  }, [isLoaded, loadError]);

  // Handle map load
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // If we don't have coordinates but have an address, try to geocode it
    if (!hasCoordinates && hasAddress && window.google) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({
        address: formatAddress(', ')
      }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          map.setCenter(location);
          
          // Add a marker at the geocoded location
          new google.maps.Marker({
            position: location,
            map: map,
            title: business.businessName || 'Business Location'
          });
        }
      });
    }
  }, [business, hasCoordinates, hasAddress]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Format address for display with custom separator
  const formatAddress = (separator = '\n') => {
    if (!hasAddress) return 'Address not available';
    
    const parts = [];
    if (business?.address) parts.push(business.address);
    if (business?.city) parts.push(business.city);
    
    let secondLine = [];
    if (business?.state) secondLine.push(business.state);
    if (business?.postalCode) secondLine.push(business.postalCode);
    
    const formattedLines = [
      parts.join(', '),
      secondLine.join(' '),
      business?.country
    ].filter(Boolean);
    
    return formattedLines.join(separator);
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