import React, { useEffect, useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  CalendarCheck, 
  User, 
  ShoppingCart, 
  Bell, 
  Star,
  Scissors,
  Clock,
  DollarSign,
  AlertCircle,
  Info,
  Check
} from 'lucide-react';
import type { Theme } from "../../../types/theme";
import { applyThemeToPreview } from "../../../utils/applyTheme";

interface ThemePreviewProps {
  previewTheme: Theme;
  showControls?: boolean;
}

export default function ThemePreview({ 
  previewTheme, 
  showControls = false 
}: ThemePreviewProps) {
  // Track preview styles
  const [previewRoot, setPreviewRoot] = useState<HTMLElement | null>(null);
  
  // Apply theme when it changes
  useEffect(() => {
    if (previewRoot) {
      applyThemeToPreview(previewTheme, previewRoot);
    }
  }, [previewTheme, previewRoot]);

  // Set up preview container ref
  useEffect(() => {
    const root = document.getElementById('theme-preview-root');
    setPreviewRoot(root);
  }, []);

  return (
    <div 
      id="theme-preview-root" 
      className="theme-preview rounded-lg overflow-hidden border p-4 bg-background text-foreground"
    >
      {/* Controls at the top if enabled */}
      {showControls && (
        <div className="mb-6 flex flex-wrap gap-4">
          <Button variant="default">Primary Button</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      )}

      {/* Tabbed content preview */}
      <Tabs defaultValue="appointments">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        
        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <div className="grid gap-4">
            {/* Alert component */}
            <Alert className="border border-primary/20 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary-foreground">
                You have 3 upcoming appointments this week.
              </AlertDescription>
            </Alert>
            
            {/* Header section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Appointments
                </CardTitle>
                <CardDescription>
                  Manage your scheduled services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Appointment card 1 */}
                  <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/10">
                    <div className="flex gap-3">
                      <div className="rounded-full p-2 bg-primary/10">
                        <Scissors className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Haircut & Styling</div>
                        <div className="text-sm text-muted-foreground flex gap-2 items-center mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          Tomorrow, 10:00 AM
                        </div>
                        <Badge className="mt-2 bg-secondary text-secondary-foreground">Confirmed</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Reschedule
                      </Button>
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                  
                  {/* Appointment card 2 */}
                  <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/10">
                    <div className="flex gap-3">
                      <div className="rounded-full p-2 bg-primary/10">
                        <Scissors className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Coloring Treatment</div>
                        <div className="text-sm text-muted-foreground flex gap-2 items-center mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          Friday, 2:30 PM
                        </div>
                        <Badge className="mt-2 bg-primary text-primary-foreground">Paid</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Reschedule
                      </Button>
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t pt-4">
                <Button variant="ghost" size="sm">
                  View history
                </Button>
                <Button size="sm">
                  Book New Appointment
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Services Tab */}
        <TabsContent value="services">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Our Services</CardTitle>
                <CardDescription>
                  Book your favorite treatments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Service 1 */}
                  <div className="flex justify-between p-4 border rounded-lg hover:bg-accent/10">
                    <div className="flex items-center gap-4">
                      <div className="rounded-md p-2.5 bg-secondary">
                        <Scissors className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">Premium Haircut</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          45 min
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className="font-medium text-lg">
                        <DollarSign className="h-4 w-4 inline" />
                        45
                      </div>
                      <Button variant="default" size="sm" className="mt-2">
                        Book Now
                      </Button>
                    </div>
                  </div>
                  
                  {/* Service 2 */}
                  <div className="flex justify-between p-4 border rounded-lg hover:bg-accent/10">
                    <div className="flex items-center gap-4">
                      <div className="rounded-md p-2.5 bg-primary">
                        <Scissors className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">Color & Highlights</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          90 min
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className="font-medium text-lg">
                        <DollarSign className="h-4 w-4 inline" />
                        120
                      </div>
                      <Button variant="default" size="sm" className="mt-2">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  * Prices may vary based on hair length
                </div>
                <Button variant="outline" size="sm">
                  View All Services
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="Jane Smith" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue="jane@example.com" />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Preferences</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive booking confirmations and reminders
                        </p>
                      </div>
                      <Switch id="notifications" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing">Marketing Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive promotions and special offers
                        </p>
                      </div>
                      <Switch id="marketing" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t pt-4">
                <Button className="ml-auto">
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}