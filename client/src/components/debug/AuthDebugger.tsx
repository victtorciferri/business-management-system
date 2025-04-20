import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

/**
 * Authentication Debugger Component
 * 
 * This component helps diagnose authentication issues
 * by showing current login state and providing tools to test auth endpoints.
 */
export function AuthDebugger() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('businessowner');
  const [password, setPassword] = useState('password123');
  const [themeTest, setThemeTest] = useState<any>(null);
  const { toast } = useToast();

  // Fetch current auth status
  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/auth-status');
      const data = await response.json();
      setAuthStatus(data);
      setLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthStatus({ error: 'Failed to check auth status' });
      setLoading(false);
    }
  };

  // Login test
  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Login successful',
          description: `Logged in as ${data.username}`,
        });
        // Refresh auth status
        checkAuth();
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid username or password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'Login error',
        description: 'An error occurred during login',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  // Test theme creation
  const testThemeCreation = async () => {
    setLoading(true);
    try {
      // First check if we're authenticated
      const authCheck = await fetch('/api/debug/auth-status');
      const authData = await authCheck.json();
      
      if (!authData.authenticated) {
        toast({
          title: 'Not authenticated',
          description: 'Please login first',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      // Test theme creation
      const response = await fetch('/api/debug/theme-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Debug Test Theme',
          businessId: authData.user?.id || 1,
          businessSlug: authData.user?.businessSlug || 'salonelegante',
        }),
      });
      
      const data = await response.json();
      setThemeTest(data);
      
      toast({
        title: data.success ? 'Theme test successful' : 'Theme test failed',
        description: data.debug ? 'Debug test completed' : 'Test failed',
        variant: data.success ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Theme test failed:', error);
      setThemeTest({ error: 'An error occurred during theme test' });
      toast({
        title: 'Theme test error',
        description: 'An error occurred during theme test',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  // Logout test
  const testLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: 'Logout successful',
          description: 'You have been logged out',
        });
        // Refresh auth status
        checkAuth();
      } else {
        toast({
          title: 'Logout failed',
          description: 'Failed to logout',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: 'Logout error',
        description: 'An error occurred during logout',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  // Check auth status on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto my-4">
      <CardHeader>
        <CardTitle>Authentication Debugger</CardTitle>
        <CardDescription>
          Debug authentication and session issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-md p-4 bg-muted/50">
          <h3 className="font-medium mb-2">Authentication Status</h3>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <pre className="bg-card p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <Input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input 
              type="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        
        {themeTest && (
          <div className="border rounded-md p-4 bg-muted/50">
            <h3 className="font-medium mb-2">Theme Test Results</h3>
            <pre className="bg-card p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(themeTest, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between flex-wrap gap-2">
        <Button onClick={checkAuth} variant="outline" disabled={loading}>
          Refresh Status
        </Button>
        <Button onClick={testLogin} disabled={loading || !username || !password}>
          Test Login
        </Button>
        <Button onClick={testThemeCreation} disabled={loading}>
          Test Theme Creation
        </Button>
        <Button onClick={testLogout} variant="outline" disabled={loading}>
          Test Logout
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AuthDebugger;