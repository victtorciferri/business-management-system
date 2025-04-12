import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/queryClient"
import { useState } from "react"

export default function ErrorTestingPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Test a simple error toast
  const testErrorToast = () => {
    toast({
      title: "Error Message",
      description: "This is a test error message that should be selectable and copyable.",
      variant: "destructive",
    })
  }

  // Test a multi-line error toast
  const testMultilineError = () => {
    toast({
      title: "Multi-line Error",
      description: "Error Details:\nPath: /api/test\nMethod: POST\nStatus: 500\nMessage: Internal Server Error\nStackTrace: at Object.process (/app/server.js:42:10)",
      variant: "destructive",
    })
  }

  // Test a successful toast
  const testSuccessToast = () => {
    toast({
      title: "Success Message",
      description: "Operation completed successfully!",
    })
  }

  // Test API error
  const testApiError = async () => {
    setIsLoading(true)
    try {
      // Making a request to an endpoint that doesn't exist
      const response = await apiRequest("GET", "/api/non-existent-endpoint")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(JSON.stringify(errorData, null, 2))
      }
    } catch (error) {
      toast({
        title: "API Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Test detailed error from our test endpoint
  const testDetailedError = async () => {
    setIsLoading(true)
    try {
      const response = await apiRequest("GET", "/api/test-error")
      const data = await response.json()
      if (!response.ok) {
        throw new Error(JSON.stringify(data, null, 2))
      }
    } catch (error) {
      toast({
        title: "Detailed Server Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Test HTTP status code error
  const testStatusCodeError = async (code: number) => {
    setIsLoading(true)
    try {
      const response = await apiRequest("GET", `/api/test-error/${code}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(JSON.stringify(data, null, 2))
      }
    } catch (error) {
      toast({
        title: `HTTP ${code} Error`,
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Test object error
  const testObjectError = () => {
    const errorObject = {
      statusCode: 403,
      error: "Forbidden",
      message: "You don't have permission to access this resource",
      details: {
        resource: "products",
        requiredPermission: "admin",
        userPermission: "user"
      }
    }

    toast({
      title: "Object Error",
      description: JSON.stringify(errorObject, null, 2),
      variant: "destructive",
    })
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Error Message Testing</h1>
      <p className="mb-8 text-muted-foreground">
        This page allows you to test different error notifications and verify if they can be selected and copied.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Basic Error</CardTitle>
            <CardDescription>Test a simple error notification</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testErrorToast}>Show Error</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Multi-line Error</CardTitle>
            <CardDescription>Test an error with multiple lines</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testMultilineError}>Show Multi-line Error</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Message</CardTitle>
            <CardDescription>Test a success notification</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testSuccessToast}>Show Success</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Error</CardTitle>
            <CardDescription>Test a real API error from backend</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testApiError} disabled={isLoading} className="w-full">
              {isLoading ? "Loading..." : "Trigger API Error"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Object Error</CardTitle>
            <CardDescription>Test displaying a complex error object</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testObjectError} className="w-full">Show Object Error</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Detailed Error</CardTitle>
            <CardDescription>Test detailed error with stack trace</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testDetailedError} disabled={isLoading} className="w-full">
              {isLoading ? "Loading..." : "Show Detailed Error"}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>HTTP 400 Error</CardTitle>
            <CardDescription>Test Bad Request error</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => testStatusCodeError(400)} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Loading..." : "Show 400 Error"}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>HTTP 404 Error</CardTitle>
            <CardDescription>Test Not Found error</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => testStatusCodeError(404)} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Loading..." : "Show 404 Error"}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>HTTP 500 Error</CardTitle>
            <CardDescription>Test Server error</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => testStatusCodeError(500)} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Loading..." : "Show 500 Error"}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Error Display Guidelines</h2>
        <div className="p-6 border rounded-lg bg-card">
          <ul className="space-y-2 list-disc pl-6">
            <li>Error messages should be <span className="font-semibold">selectable</span> so users can copy error details</li>
            <li>Detailed error information should be displayed in <span className="font-mono text-xs bg-muted p-1 rounded">monospace font</span> with proper formatting</li>
            <li>Server-side error responses include:
              <ul className="pl-6 mt-2 space-y-1 list-disc">
                <li>Message - A clear description of what went wrong</li>
                <li>Error type/name - The class of error that occurred</li>
                <li>Stack trace - For detailed debugging (development only)</li>
                <li>Request path and method - Where the error occurred</li>
                <li>Timestamp - When the error occurred</li>
              </ul>
            </li>
            <li>All error notifications automatically dismiss after 10 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  )
}