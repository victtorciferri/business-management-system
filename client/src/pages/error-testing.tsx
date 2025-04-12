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
            <Button onClick={testApiError} disabled={isLoading}>
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
            <Button onClick={testObjectError}>Show Object Error</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}