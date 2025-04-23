import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';

export function AuthDebugger() {
  const { toast } = useToast();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth-status', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to check auth status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setDebugInfo(data);
      
      toast({
        title: 'Auth Status',
        description: `Authenticated: ${data.authenticated ? 'Yes' : 'No'} (Method: ${data.method})`,
      });
    } catch (error) {
      console.error('Error checking auth status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to check auth status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Authentication Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button 
            onClick={checkAuthStatus}
            disabled={loading} 
            variant="outline"
          >
            {loading ? 'Checking...' : 'Check Auth Status'}
          </Button>
          
          {debugInfo && (
            <div className="p-3 border rounded bg-muted/50 mt-4">
              <h3 className="font-semibold text-sm mb-2">Auth Debug Info:</h3>
              <pre className="text-xs overflow-auto p-2 bg-background rounded whitespace-pre-wrap">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        This tool helps diagnose authentication issues with file uploads.
      </CardFooter>
    </Card>
  );
}