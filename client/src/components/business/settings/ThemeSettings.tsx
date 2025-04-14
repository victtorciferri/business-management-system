import React from 'react';
import { ThemeEditor } from '../theme-customization/ThemeEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Container, Section } from '@/components/ui/layout';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export function ThemeSettings() {
  return (
    <Container>
      <div className="flex items-center py-4">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/dashboard/settings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Theme & Appearance</h1>
      </div>
      
      <Tabs defaultValue="theme-editor" className="mt-6">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="theme-editor">Theme Editor</TabsTrigger>
          <TabsTrigger value="template-settings">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="theme-editor" className="mt-6">
          <ThemeEditor />
        </TabsContent>
        
        <TabsContent value="template-settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Industry Templates</CardTitle>
              <CardDescription>
                Choose a template that best fits your business type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TemplateCard 
                  title="General Business" 
                  description="A versatile template suitable for most business types" 
                  type="general"
                  isSelected={true}
                />
                <TemplateCard 
                  title="Salon & Beauty" 
                  description="Designed for hair salons, nail salons, and spa businesses" 
                  type="salon"
                />
                <TemplateCard 
                  title="Fitness & Wellness" 
                  description="Perfect for gyms, yoga studios, and personal trainers" 
                  type="fitness"
                />
                <TemplateCard 
                  title="Medical & Health" 
                  description="Tailored for medical practices, therapists, and healthcare providers" 
                  type="medical"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}

interface TemplateCardProps {
  title: string;
  description: string;
  type: string;
  isSelected?: boolean;
}

function TemplateCard({ title, description, type, isSelected }: TemplateCardProps) {
  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${
      isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:shadow-md'
    }`}>
      <div className="h-40 bg-muted relative">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          {/* Placeholder for template preview image */}
          {type} template preview
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-3">{description}</p>
        <Button className="w-full" variant={isSelected ? "default" : "outline"}>
          {isSelected ? "Current Template" : "Select Template"}
        </Button>
      </div>
    </div>
  );
}