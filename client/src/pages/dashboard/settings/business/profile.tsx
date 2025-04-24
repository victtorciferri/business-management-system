import React from 'react';
import { Link } from 'wouter';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { Container } from '@/components/ui/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Building, Phone, Mail, ExternalLink } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BusinessLogo } from '@/components/business/BusinessLogo';

export default function BusinessProfilePage() {
  const { business } = useBusinessContext();

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
          <h1 className="text-2xl font-bold">Business Profile</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Logo Card */}
          <Card>
            <CardHeader>
              <CardTitle>Business Logo</CardTitle>
              <CardDescription>
                Your current business logo
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="mb-4">
                {business && (
                  <BusinessLogo
                    business={business}
                    size="large"
                    aspectRatio="square"
                    showLabel={true}
                  />
                )}
              </div>
              <Button 
                variant="outline"
                size="sm"
                asChild
              >
                <Link href="/business-profile-page">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Edit Logo
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Business Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Your business details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium flex items-center">
                  <Building className="h-4 w-4 mr-2 text-primary" />
                  Business Name
                </h3>
                <p className="text-muted-foreground">{business?.businessName || 'Not set'}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2 text-primary" />
                  Business URL
                </h3>
                <p className="text-muted-foreground">
                  {business?.businessSlug ? `/${business.businessSlug}` : 'Not set'}
                </p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-primary" />
                  Email
                </h3>
                <p className="text-muted-foreground">{business?.email || 'Not set'}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-primary" />
                  Phone
                </h3>
                <p className="text-muted-foreground">{business?.phone || 'Not set'}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  Location
                </h3>
                {business?.address ? (
                  <div>
                    <p className="text-muted-foreground">
                      {business.address}
                      {business.city && `, ${business.city}`}
                      {business.state && `, ${business.state}`}
                      {business.postalCode && ` ${business.postalCode}`}
                    </p>
                    {business.country && (
                      <p className="text-muted-foreground">{business.country}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No address set</p>
                )}
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                  className="mt-2"
                >
                  <Link href="/dashboard/settings/business/location">
                    <MapPin className="h-4 w-4 mr-2" />
                    Update Location
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </ProtectedRoute>
  );
}