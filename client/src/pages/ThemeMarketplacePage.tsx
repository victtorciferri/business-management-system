/**
 * ThemeMarketplacePage - 2025 Edition
 *
 * This page showcases the theme marketplace feature with ability to
 * browse, preview, and apply themes to the current business.
 */

import React from 'react';
import { ThemeMarketplace } from '@/components/theme-marketplace/ThemeMarketplace';
import { useBusinessTheme } from '@/providers/MultiTenantThemeProvider';
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/ui/page-header';
import { useToast } from '@/hooks/use-toast';
// Using a simple loading spinner instead of a separate component
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export function ThemeMarketplacePage() {
  const { applyTheme, activeTheme, isLoading } = useBusinessTheme();
  const { toast } = useToast();
  
  // Handle applying a theme
  const handleApplyTheme = async (themeData: any) => {
    try {
      if (!applyTheme) {
        throw new Error('Theme application not available');
      }
      
      // Apply the theme
      await applyTheme(themeData);
      
      return true;
    } catch (error) {
      console.error('Error applying theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply theme. Please try again.',
        variant: 'destructive',
      });
      
      throw error;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader className="p-0">
          <PageHeaderHeading>Theme Marketplace</PageHeaderHeading>
          <PageHeaderDescription>
            Browse and apply professional themes for your business appearance
          </PageHeaderDescription>
        </PageHeader>
        
        <Link href="/dashboard/settings">
          <Button variant="outline" className="gap-2">
            <ArrowLeft size={16} />
            Back to Settings
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <ThemeMarketplace onApplyTheme={handleApplyTheme} />
      </div>
    </div>
  );
}