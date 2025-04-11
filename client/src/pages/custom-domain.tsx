import { useState, useEffect } from 'react';
import Layout from "@/components/layout/header";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, Globe, Link, RefreshCw } from "lucide-react";
import { apiRequest } from '@/lib/queryClient';

export default function CustomDomainManagement() {
  // Normally this would be fetched from the user context
  const currentUser: User = {
    id: 1,
    username: "businessowner",
    password: "password",
    email: "owner@example.com",
    businessName: "Salon Elegante",
    businessSlug: "salonelegante",
    customDomain: "salonelegante.cl",
    phone: "+56 9 9876 5432",
    createdAt: new Date()
  };
  
  const { toast } = useToast();
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [setupStatus, setSetupStatus] = useState<'not_started' | 'in_progress' | 'complete'>('not_started');
  const [validationError, setValidationError] = useState('');
  
  // Load domains from the API
  useEffect(() => {
    async function loadDomains() {
      try {
        setLoading(true);
        const response = await apiRequest('GET', `/api/domains?userId=${currentUser.id}`);
        const data = await response.json();
        setDomains(data.domains || []);
        
        // Check if custom domain is set
        if (currentUser.customDomain) {
          setSetupStatus('complete');
        }
      } catch (error) {
        console.error('Error loading domains:', error);
        toast({
          title: "Failed to load domains",
          description: "Couldn't retrieve your custom domains. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadDomains();
  }, [currentUser.id, currentUser.customDomain, toast]);
  
  // Function to validate a domain
  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      setValidationError('Invalid domain format. Please enter a valid domain (e.g., "yourbusiness.com")');
      return false;
    }
    
    setValidationError('');
    return true;
  };
  
  // Function to add a new domain
  const addDomain = async () => {
    if (!validateDomain(newDomain)) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/domains', {
        userId: currentUser.id,
        domain: newDomain
      });
      
      if (response.ok) {
        const data = await response.json();
        setDomains([...domains, { domain: newDomain, created_at: new Date() }]);
        setNewDomain('');
        setSetupStatus('in_progress');
        
        toast({
          title: "Domain registered successfully",
          description: "Your domain was registered and will be available once DNS propagation is complete.",
          variant: "default",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Failed to register domain",
          description: error.message || "Couldn't register your domain. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error registering domain:', error);
      toast({
        title: "Failed to register domain",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout currentUser={currentUser}>
      <div className="container max-w-4xl py-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter">Custom Domain Management</h1>
            <p className="text-lg text-muted-foreground">
              Connect your own domain to your AppointEase business portal for a professional branded experience.
            </p>
          </div>
          
          <Tabs defaultValue="setup">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="setup">Domain Setup</TabsTrigger>
              <TabsTrigger value="info">Setup Instructions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="setup" className="space-y-6 mt-6">
              {setupStatus === 'complete' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertTitle className="text-green-800">Domain Active</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Your custom domain <strong>{currentUser.customDomain}</strong> is active and connected to your business portal.
                  </AlertDescription>
                </Alert>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Register a Custom Domain</CardTitle>
                  <CardDescription>
                    Add your own domain to create a professional branded experience for your customers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="domain">Domain Name</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="domain" 
                          placeholder="yourbusiness.com" 
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                        />
                        <Button 
                          onClick={addDomain} 
                          disabled={loading || !newDomain}
                        >
                          {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                          Register
                        </Button>
                      </div>
                      {validationError && (
                        <p className="text-sm text-red-500">{validationError}</p>
                      )}
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="text-sm font-medium mb-2">Your Domains</h3>
                      {domains.length === 0 ? (
                        <p className="text-sm text-muted-foreground">You haven't registered any custom domains yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {domains.map((domain, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-md">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-primary" />
                                <span>{domain.domain}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Registered on {new Date(domain.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-muted/40 border-t">
                  <div className="text-sm text-muted-foreground">
                    Current URL: 
                    <code className="ml-1 px-1 bg-muted rounded">
                      appointease.com/{currentUser.businessSlug}
                    </code>
                  </div>
                  {currentUser.customDomain && (
                    <div className="text-sm">
                      Custom URL: 
                      <a 
                        href={`https://${currentUser.customDomain}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-1 text-primary hover:underline flex items-center"
                      >
                        {currentUser.customDomain}
                        <Link className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                </CardFooter>
              </Card>
              
              {setupStatus === 'in_progress' && (
                <Alert>
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle>Domain Setup In Progress</AlertTitle>
                  <AlertDescription>
                    Your domain has been registered with AppointEase, but you still need to configure your DNS settings.
                    See the "Setup Instructions" tab for detailed instructions.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="info" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Domain Setup Instructions</CardTitle>
                  <CardDescription>
                    Follow these steps to configure your DNS settings and connect your domain.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Step 1: Access DNS Settings</h3>
                      <p className="text-muted-foreground">
                        Log in to your domain registrar (GoDaddy, Namecheap, etc.) and find the DNS management section.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Step 2: Add DNS Records</h3>
                      <p className="text-muted-foreground mb-4">
                        Add either a CNAME record or A records as shown below:
                      </p>
                      
                      <div className="space-y-4">
                        <div className="border rounded-md overflow-hidden">
                          <div className="bg-muted p-3 border-b">
                            <h4 className="font-medium">Option A: CNAME Record (Recommended)</h4>
                          </div>
                          <div className="p-3">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="py-2 px-3 text-left">Type</th>
                                  <th className="py-2 px-3 text-left">Host</th>
                                  <th className="py-2 px-3 text-left">Value</th>
                                  <th className="py-2 px-3 text-left">TTL</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="py-2 px-3">CNAME</td>
                                  <td className="py-2 px-3">@</td>
                                  <td className="py-2 px-3">appointease.com</td>
                                  <td className="py-2 px-3">3600</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        <div className="border rounded-md overflow-hidden">
                          <div className="bg-muted p-3 border-b">
                            <h4 className="font-medium">Option B: A Records</h4>
                          </div>
                          <div className="p-3">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="py-2 px-3 text-left">Type</th>
                                  <th className="py-2 px-3 text-left">Host</th>
                                  <th className="py-2 px-3 text-left">Value</th>
                                  <th className="py-2 px-3 text-left">TTL</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b">
                                  <td className="py-2 px-3">A</td>
                                  <td className="py-2 px-3">@</td>
                                  <td className="py-2 px-3">203.0.113.1</td>
                                  <td className="py-2 px-3">3600</td>
                                </tr>
                                <tr>
                                  <td className="py-2 px-3">A</td>
                                  <td className="py-2 px-3">www</td>
                                  <td className="py-2 px-3">203.0.113.1</td>
                                  <td className="py-2 px-3">3600</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Step 3: Wait for DNS Propagation</h3>
                      <p className="text-muted-foreground">
                        DNS changes can take up to 48 hours to propagate worldwide, though most changes take effect within a few hours.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Step 4: Verify Your Domain</h3>
                      <p className="text-muted-foreground">
                        Once DNS propagation is complete, your custom domain will automatically be verified and activated.
                        SSL certificates will be automatically provisioned for secure HTTPS access.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/40 border-t">
                  <div className="text-sm text-muted-foreground">
                    Need more help? Visit our{" "}
                    <a href="/domain-setup" className="text-primary hover:underline">
                      detailed domain setup instructions
                    </a>{" "}
                    or contact support.
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}