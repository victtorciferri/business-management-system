import React from 'react';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { Container, Section } from '@/components/ui/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Palette, 
  Globe, 
  CreditCard, 
  Bell, 
  Users, 
  Lock, 
  ArrowRight, 
  Building,
  Clock, 
  Key, 
  MapPin, 
  Receipt, 
  RefreshCw, 
  AlertTriangle, 
  Webhook 
} from 'lucide-react';
import { Link } from 'wouter';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SettingsPage() {
  const { business, isLoading } = useBusinessContext();
  
  return (
    <ProtectedRoute>
      <Container className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your business settings and preferences
          </p>
        </div>
        
        <Tabs defaultValue="general" className="space-y-6">
          <div className="border-b">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="general"
                className="rounded-none border-b-2 border-b-transparent px-4 pb-3 pt-2 data-[state=active]:border-b-primary data-[state=active]:bg-transparent"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="rounded-none border-b-2 border-b-transparent px-4 pb-3 pt-2 data-[state=active]:border-b-primary data-[state=active]:bg-transparent"
              >
                Appearance
              </TabsTrigger>
              <TabsTrigger
                value="business"
                className="rounded-none border-b-2 border-b-transparent px-4 pb-3 pt-2 data-[state=active]:border-b-primary data-[state=active]:bg-transparent"
              >
                Business Info
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="rounded-none border-b-2 border-b-transparent px-4 pb-3 pt-2 data-[state=active]:border-b-primary data-[state=active]:bg-transparent"
              >
                Billing
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="rounded-none border-b-2 border-b-transparent px-4 pb-3 pt-2 data-[state=active]:border-b-primary data-[state=active]:bg-transparent"
              >
                Advanced
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* General Settings */}
          <TabsContent value="general" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingCard
                title="Account Settings"
                description="Manage your account details and preferences"
                icon={<Users className="h-5 w-5" />}
                href="/dashboard/settings/account"
              />
              <SettingCard
                title="Notifications"
                description="Configure your notification preferences"
                icon={<Bell className="h-5 w-5" />}
                href="/dashboard/settings/notifications"
              />
              <SettingCard
                title="Security"
                description="Manage your password and security settings"
                icon={<Lock className="h-5 w-5" />}
                href="/dashboard/settings/security"
              />
              <SettingCard
                title="Domain Settings"
                description="Configure your custom domain and URL settings"
                icon={<Globe className="h-5 w-5" />}
                href="/dashboard/settings/domain"
              />
            </div>
          </TabsContent>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingCard
                title="Modern Theme Editor (2025)"
                description="Use the new sophisticated design token system"
                icon={<Palette className="h-5 w-5" />}
                href="/theme-editor"
                featured
              />
              <SettingCard
                title="Theme Marketplace"
                description="Explore and install pre-designed professional themes"
                icon={<Palette className="h-5 w-5" />}
                href="/theme-marketplace"
              />
              <SettingCard
                title="Legacy Theme Editor"
                description="Use the older theme customization tools"
                icon={<Palette className="h-5 w-5" />}
                href="/admin-theme-editor/1"
              />
              <SettingCard
                title="Templates"
                description="Choose and customize industry-specific templates"
                icon={<Building className="h-5 w-5" />}
                href="/dashboard/settings/theme/templates"
              />
            </div>
          </TabsContent>
          
          {/* Business Info Settings */}
          <TabsContent value="business" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingCard
                title="Business Profile"
                description="Update your business information and details"
                icon={<Building className="h-5 w-5" />}
                href="/dashboard/settings/business/profile"
              />
              <SettingCard
                title="Business Hours"
                description="Set your business hours and availability"
                icon={<Clock className="h-5 w-5" />}
                href="/dashboard/settings/business/hours"
              />
              <SettingCard
                title="Staff Management"
                description="Manage staff members and permissions"
                icon={<Users className="h-5 w-5" />}
                href="/dashboard/settings/business/staff"
              />
              <SettingCard
                title="Location"
                description="Manage your business location and map settings"
                icon={<MapPin className="h-5 w-5" />}
                href="/dashboard/settings/business/location"
              />
            </div>
          </TabsContent>
          
          {/* Billing Settings */}
          <TabsContent value="billing" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingCard
                title="Subscription"
                description="Manage your subscription plan and billing"
                icon={<CreditCard className="h-5 w-5" />}
                href="/dashboard/settings/billing/subscription"
              />
              <SettingCard
                title="Payment Methods"
                description="Manage your payment methods and billing information"
                icon={<CreditCard className="h-5 w-5" />}
                href="/dashboard/settings/billing/payment-methods"
              />
              <SettingCard
                title="Billing History"
                description="View your billing history and invoices"
                icon={<Receipt className="h-5 w-5" />}
                href="/dashboard/settings/billing/history"
              />
            </div>
          </TabsContent>
          
          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingCard
                title="API Keys"
                description="Manage API keys and integrations"
                icon={<Key className="h-5 w-5" />}
                href="/dashboard/settings/advanced/api-keys"
              />
              <SettingCard
                title="Webhooks"
                description="Configure webhooks for automated workflows"
                icon={<Webhook className="h-5 w-5" />}
                href="/dashboard/settings/advanced/webhooks"
              />
              <SettingCard
                title="Import & Export"
                description="Import or export your business data"
                icon={<RefreshCw className="h-5 w-5" />}
                href="/dashboard/settings/advanced/import-export"
              />
              <SettingCard
                title="Danger Zone"
                description="Delete your account or business"
                icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
                href="/dashboard/settings/advanced/danger-zone"
                variant="destructive"
              />
            </div>
          </TabsContent>
        </Tabs>
      </Container>
    </ProtectedRoute>
  );
}

interface SettingCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  featured?: boolean;
  variant?: 'default' | 'destructive';
}

function SettingCard({ 
  title, 
  description, 
  icon, 
  href, 
  featured = false, 
  variant = 'default' 
}: SettingCardProps) {
  return (
    <Card className={`
      relative overflow-hidden transition-shadow hover:shadow-md 
      ${featured ? 'ring-2 ring-primary ring-offset-2' : ''}
      ${variant === 'destructive' ? 'border-destructive/20' : ''}
    `}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className={`
            size-8 rounded-full flex items-center justify-center
            ${variant === 'destructive' 
              ? 'bg-destructive/10 text-destructive' 
              : 'bg-primary/10 text-primary'}
          `}>
            {icon}
          </div>
          <CardTitle className={`
            ${variant === 'destructive' ? 'text-destructive' : ''}
          `}>
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          {description}
        </CardDescription>
        <Button 
          variant={variant === 'destructive' ? 'destructive' : 'default'} 
          className="w-full"
          asChild
        >
          <Link href={href}>
            Configure
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
      {featured && (
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 rotate-45 bg-primary text-primary-foreground px-6 py-1 text-xs font-medium">
          New
        </div>
      )}
    </Card>
  );
}