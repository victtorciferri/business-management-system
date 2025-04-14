import React, { useState } from 'react';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { Container, Section } from '@/components/ui/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function TemplateSettingsPage() {
  const { business, config, refreshBusinessData } = useBusinessContext();
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(config.industryType);
  
  // Handle template change
  const handleTemplateChange = async (template: string) => {
    if (!business || template === config.industryType) return;
    
    setIsChanging(true);
    
    try {
      await apiRequest('/api/business/template', {
        method: 'POST',
        body: JSON.stringify({
          businessId: business.id,
          industryType: template
        })
      });
      
      // Refresh business data
      await refreshBusinessData();
      
      toast({
        title: 'Template updated',
        description: 'Your business template has been updated successfully.',
      });
      
      setSelectedTemplate(template);
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to update template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsChanging(false);
    }
  };
  
  // Define available templates
  const templates = [
    {
      id: 'general',
      name: 'General Business',
      description: 'A versatile template suitable for most business types',
      features: ['Basic appointment booking', 'Simple customer management', 'Multipurpose layout']
    },
    {
      id: 'salon',
      name: 'Salon & Beauty',
      description: 'Designed for hair salons, nail salons, and spa businesses',
      features: ['Staff assignment', 'Service-specific duration', 'Beauty-focused imagery']
    },
    {
      id: 'fitness',
      name: 'Fitness & Wellness',
      description: 'Perfect for gyms, yoga studios, and personal trainers',
      features: ['Class scheduling', 'Membership tracking', 'Fitness-oriented interface']
    },
    {
      id: 'medical',
      name: 'Medical & Health',
      description: 'Tailored for medical practices, therapists, and healthcare providers',
      features: ['HIPAA compliance features', 'Patient records', 'Medical appointment focus']
    }
  ];
  
  return (
    <ProtectedRoute>
      <Container>
        <div className="flex items-center py-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/dashboard/settings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Industry Templates</h1>
        </div>
        
        <Alert className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Changing Templates</AlertTitle>
          <AlertDescription>
            Changing your template may affect the visual appearance of your business portal and customer-facing pages.
            Your data will not be lost, but some settings may be reset to defaults.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              isChanging={isChanging}
              onSelect={() => handleTemplateChange(template.id)}
            />
          ))}
        </div>
        
        <Section>
          <Card>
            <CardHeader>
              <CardTitle>Advanced Template Settings</CardTitle>
              <CardDescription>
                Fine-tune your template settings or create custom templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild>
                  <Link href="/theme-editor">
                    Customize Current Template
                  </Link>
                </Button>
                <Button variant="outline">
                  Create Custom Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </Section>
      </Container>
    </ProtectedRoute>
  );
}

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string;
    features: string[];
  };
  isSelected: boolean;
  isChanging: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, isSelected, isChanging, onSelect }: TemplateCardProps) {
  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${
      isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
    }`}>
      <div className="h-48 bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">{template.id.toUpperCase()}</p>
          <p className="text-sm">Template Preview</p>
        </div>
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{template.name}</CardTitle>
          {isSelected && (
            <div className="bg-primary/10 text-primary rounded-full p-1">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Key Features:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {template.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="h-3 w-3 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <Button 
          onClick={onSelect} 
          variant={isSelected ? "secondary" : "default"}
          disabled={isChanging || isSelected}
          className="w-full"
        >
          {isSelected 
            ? "Current Template" 
            : isChanging 
              ? "Changing..." 
              : "Select Template"}
        </Button>
      </CardContent>
    </Card>
  );
}