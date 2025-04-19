/**
 * ComponentVariantsDemo Component - 2025 Edition
 *
 * This component showcases the variant-aware components with
 * interactive examples and a variety of variant combinations.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Import our variant-aware components
import { VariantAwareButton, ButtonVariant, ButtonSize } from './VariantAwareButton';
import { 
  VariantAwareCard, 
  VariantAwareCardHeader, 
  VariantAwareCardTitle, 
  VariantAwareCardDescription,
  VariantAwareCardContent,
  VariantAwareCardFooter,
  CardVariant,
  CardSize
} from './VariantAwareCard';
import { VariantAwareBadge, BadgeVariant, BadgeSize } from './VariantAwareBadge';
import { VariantAwareInput, InputVariant, InputSize } from './VariantAwareInput';

// Demo section for buttons
const ButtonsDemo = () => {
  const [variant, setVariant] = useState<ButtonVariant>('primary');
  const [size, setSize] = useState<ButtonSize>('md');
  const [isLoading, setIsLoading] = useState(false);
  
  const variants: ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'];
  const sizes: ButtonSize[] = ['sm', 'md', 'lg', 'xl'];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="button-variant">Variant</Label>
            <Select
              value={variant}
              onValueChange={(value) => setVariant(value as ButtonVariant)}
            >
              <SelectTrigger id="button-variant" className="w-full">
                <SelectValue placeholder="Select variant" />
              </SelectTrigger>
              <SelectContent>
                {variants.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="button-size">Size</Label>
            <Select
              value={size}
              onValueChange={(value) => setSize(value as ButtonSize)}
            >
              <SelectTrigger id="button-size" className="w-full">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="button-loading"
              checked={isLoading}
              onChange={() => setIsLoading(!isLoading)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="button-loading">Loading State</Label>
          </div>
        </div>
        
        <div className="flex flex-col space-y-6 items-center justify-center bg-muted/20 rounded-md p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
            <VariantAwareButton
              variant={variant}
              size={size}
              isLoading={isLoading}
            >
              Button Text
            </VariantAwareButton>
          </div>
          
          <div className="w-full text-center text-xs text-muted-foreground">
            <code>{`<VariantAwareButton variant="${variant}" size="${size}" ${isLoading ? 'isLoading' : ''}>Button Text</VariantAwareButton>`}</code>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h4 className="text-base font-medium mb-3">All Button Variants</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {variants.map((variant) => (
            <VariantAwareButton key={variant} variant={variant} size="md">
              {variant}
            </VariantAwareButton>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-base font-medium mb-3">Size Variations</h4>
        <div className="flex flex-wrap gap-3 items-end">
          {sizes.map((size) => (
            <VariantAwareButton key={size} variant="primary" size={size}>
              {size}
            </VariantAwareButton>
          ))}
        </div>
      </div>
    </div>
  );
};

// Demo section for cards
const CardsDemo = () => {
  const [variant, setVariant] = useState<CardVariant>('default');
  const [size, setSize] = useState<CardSize>('md');
  const [withHover, setWithHover] = useState(false);
  const [withShadow, setWithShadow] = useState(true);
  
  const variants: CardVariant[] = ['default', 'primary', 'secondary', 'outline', 'flat'];
  const sizes: CardSize[] = ['sm', 'md', 'lg'];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="card-variant">Variant</Label>
            <Select
              value={variant}
              onValueChange={(value) => setVariant(value as CardVariant)}
            >
              <SelectTrigger id="card-variant" className="w-full">
                <SelectValue placeholder="Select variant" />
              </SelectTrigger>
              <SelectContent>
                {variants.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="card-size">Size</Label>
            <Select
              value={size}
              onValueChange={(value) => setSize(value as CardSize)}
            >
              <SelectTrigger id="card-size" className="w-full">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="card-hover"
              checked={withHover}
              onChange={() => setWithHover(!withHover)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="card-hover">Hover Effect</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="card-shadow"
              checked={withShadow}
              onChange={() => setWithShadow(!withShadow)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="card-shadow">With Shadow</Label>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
          <VariantAwareCard
            variant={variant}
            size={size}
            withHover={withHover}
            withShadow={withShadow}
            headerContent={
              <div>
                <VariantAwareCardTitle>Card Title</VariantAwareCardTitle>
                <VariantAwareCardDescription>Card description and subtitle</VariantAwareCardDescription>
              </div>
            }
            footerContent={
              <div className="flex justify-end">
                <VariantAwareButton variant="outline" size="sm">Cancel</VariantAwareButton>
                <VariantAwareButton variant="primary" size="sm" className="ml-2">Submit</VariantAwareButton>
              </div>
            }
          >
            <p className="text-sm">
              This is the main content of the card. It can contain any elements you need.
            </p>
          </VariantAwareCard>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h4 className="text-base font-medium mb-3">All Card Variants</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {variants.map((variant) => (
            <VariantAwareCard
              key={variant}
              variant={variant}
              size="sm"
            >
              <VariantAwareCardTitle className="mb-2">{variant} Card</VariantAwareCardTitle>
              <p className="text-sm">Sample content for {variant} card variant.</p>
            </VariantAwareCard>
          ))}
        </div>
      </div>
    </div>
  );
};

// Demo section for badges
const BadgesDemo = () => {
  const [variant, setVariant] = useState<BadgeVariant>('primary');
  const [size, setSize] = useState<BadgeSize>('md');
  const [removable, setRemovable] = useState(false);
  
  const variants: BadgeVariant[] = [
    'default', 'primary', 'secondary', 'outline', 
    'success', 'warning', 'error', 'info'
  ];
  const sizes: BadgeSize[] = ['sm', 'md', 'lg'];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="badge-variant">Variant</Label>
            <Select
              value={variant}
              onValueChange={(value) => setVariant(value as BadgeVariant)}
            >
              <SelectTrigger id="badge-variant" className="w-full">
                <SelectValue placeholder="Select variant" />
              </SelectTrigger>
              <SelectContent>
                {variants.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="badge-size">Size</Label>
            <Select
              value={size}
              onValueChange={(value) => setSize(value as BadgeSize)}
            >
              <SelectTrigger id="badge-size" className="w-full">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="badge-removable"
              checked={removable}
              onChange={() => setRemovable(!removable)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="badge-removable">Removable</Label>
          </div>
        </div>
        
        <div className="flex flex-col space-y-6 items-center justify-center bg-muted/20 rounded-md p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
            <VariantAwareBadge
              variant={variant}
              size={size}
              removable={removable}
              onRemove={() => alert('Badge removed')}
            >
              Badge Text
            </VariantAwareBadge>
          </div>
          
          <div className="w-full text-center text-xs text-muted-foreground">
            <code>{`<VariantAwareBadge variant="${variant}" size="${size}" ${removable ? 'removable onRemove={() => {}}' : ''}>Badge Text</VariantAwareBadge>`}</code>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h4 className="text-base font-medium mb-3">All Badge Variants</h4>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => (
            <VariantAwareBadge key={variant} variant={variant} size="md">
              {variant}
            </VariantAwareBadge>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-base font-medium mb-3">Size Variations</h4>
        <div className="flex flex-wrap gap-2 items-center">
          {sizes.map((size) => (
            <VariantAwareBadge key={size} variant="primary" size={size}>
              {size} size
            </VariantAwareBadge>
          ))}
        </div>
      </div>
    </div>
  );
};

// Demo section for inputs
const InputsDemo = () => {
  const [variant, setVariant] = useState<InputVariant>('default');
  const [size, setSize] = useState<InputSize>('md');
  const [showError, setShowError] = useState(false);
  const [showAddons, setShowAddons] = useState(false);
  
  const variants: InputVariant[] = ['default', 'filled', 'outline', 'underlined'];
  const sizes: InputSize[] = ['sm', 'md', 'lg'];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="input-variant">Variant</Label>
            <Select
              value={variant}
              onValueChange={(value) => setVariant(value as InputVariant)}
            >
              <SelectTrigger id="input-variant" className="w-full">
                <SelectValue placeholder="Select variant" />
              </SelectTrigger>
              <SelectContent>
                {variants.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="input-size">Size</Label>
            <Select
              value={size}
              onValueChange={(value) => setSize(value as InputSize)}
            >
              <SelectTrigger id="input-size" className="w-full">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="input-error"
              checked={showError}
              onChange={() => setShowError(!showError)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="input-error">Show Error</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="input-addons"
              checked={showAddons}
              onChange={() => setShowAddons(!showAddons)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="input-addons">Show Addons</Label>
          </div>
        </div>
        
        <div className="flex flex-col space-y-6 items-start justify-center bg-muted/20 rounded-md p-6">
          <div className="w-full">
            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
            <VariantAwareInput
              variant={variant}
              size={size}
              placeholder="Enter text..."
              error={showError}
              errorMessage={showError ? "This field has an error" : undefined}
              leftAddon={showAddons ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-4 h-4"
                >
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              ) : undefined}
              rightAddon={showAddons ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-4 h-4"
                >
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
              ) : undefined}
              fullWidth
            />
          </div>
          
          <div className="w-full text-center text-xs text-muted-foreground">
            <code>{`<VariantAwareInput variant="${variant}" size="${size}" ${showError ? 'error errorMessage="This field has an error"' : ''} ${showAddons ? 'leftAddon={...} rightAddon={...}' : ''} />`}</code>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h4 className="text-base font-medium mb-3">All Input Variants</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {variants.map((variant) => (
            <VariantAwareInput
              key={variant}
              variant={variant}
              size="md"
              placeholder={`${variant} input`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Main component to showcase all variant-aware components
export function ComponentVariantsDemo() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Component Variants Demo</CardTitle>
          <CardDescription>
            Explore the 2025 Edition component variants system with different styles and options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="buttons" className="w-full">
            <TabsList className="w-full md:w-auto mb-6 grid grid-cols-4 md:inline-flex">
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="inputs">Inputs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="buttons" className="space-y-6">
              <ButtonsDemo />
            </TabsContent>
            
            <TabsContent value="cards" className="space-y-6">
              <CardsDemo />
            </TabsContent>
            
            <TabsContent value="badges" className="space-y-6">
              <BadgesDemo />
            </TabsContent>
            
            <TabsContent value="inputs" className="space-y-6">
              <InputsDemo />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}