import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function DebugLoginPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({ 
    username: "businessowner", 
    password: "password123" 
  });
  
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setResponse("Sending login request...");
      
      // Direct approach for login
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });
      
      const responseText = await response.text();
      setResponse(`Status: ${response.status} ${response.statusText}\nResponse: ${responseText}`);
      
      if (!response.ok) {
        throw new Error(`Login failed with status ${response.status}`);
      }
      
      let userData;
      try {
        userData = JSON.parse(responseText);
        console.log('Login successful:', userData);
        
        // Manually update the query client
        queryClient.setQueryData(["/api/user"], userData);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.username}!`,
        });
      } catch (parseError) {
        toast({
          title: "Error parsing response",
          description: "The server response couldn't be parsed as JSON",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Check session
      await checkSession();
      
      // On success, don't redirect automatically - allow user to check session status
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  const checkSession = async () => {
    try {
      setResponse(prev => `${prev}\n\nChecking session with /api/user...`);
      const userResponse = await fetch('/api/user');
      
      const responseText = await userResponse.text();
      setResponse(prev => `${prev}\nSession check status: ${userResponse.status} ${userResponse.statusText}\nResponse: ${responseText}`);
      
      if (userResponse.ok) {
        try {
          const userData = JSON.parse(responseText);
          toast({
            title: "Session verified",
            description: `Logged in as ${userData.username}`,
          });
        } catch (e) {
          toast({
            title: "Error parsing user data",
            description: "The server response couldn't be parsed as JSON",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Session check failed",
          description: `Status: ${userResponse.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Session check error:', error);
      toast({
        title: "Session check failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const goHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Debug Login</CardTitle>
            <CardDescription>
              For troubleshooting authentication issues
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  name="username"
                  placeholder="Enter your username" 
                  value={loginForm.username}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              
              {response && (
                <div className="mt-4">
                  <Label>Response:</Label>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mt-1 overflow-auto max-h-60">
                    <pre className="text-xs whitespace-pre-wrap">{response}</pre>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  "Debug Login"
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={checkSession}
                disabled={isLoading}
              >
                Check Current Session
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={goHome}
              >
                Back to Home
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}