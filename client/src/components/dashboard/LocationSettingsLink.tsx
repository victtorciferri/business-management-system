import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Link } from 'wouter';

/**
 * This component provides a direct quick access link to the location settings
 * from the dashboard, making it easier for users to find this important setting
 */
export function LocationSettingsLink() {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium mb-1 flex items-center gap-1">
              <MapPin className="h-4 w-4 text-primary" />
              Business Location
            </h3>
            <p className="text-sm text-muted-foreground">
              Add your address to enable Google Maps integration
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard/settings/business/location">
              Configure
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}