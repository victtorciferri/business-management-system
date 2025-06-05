import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

// Define schemas for email check and customer information
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
});

const customerInfoSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional()
});

type EmailFormValues = z.infer<typeof emailSchema>;
type CustomerFormValues = z.infer<typeof customerInfoSchema>;

interface CustomerCheckProps {
  businessId: number;
  onExistingCustomer: (customer: any) => void;
  onNewCustomer: (customerData: CustomerFormValues) => void;
}

export function CustomerCheck({ businessId, onExistingCustomer, onNewCustomer }: CustomerCheckProps) {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [customerExists, setCustomerExists] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");

  // Email form for checking if customer exists
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: ""
    }
  });

  // Customer info form for new customers
  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: ""
    }
  });

  // Handle email check submission
  const onCheckEmail = async (values: EmailFormValues) => {
    setIsChecking(true);
    try {      const response = await apiRequest("POST", "/api/customers/check-customer-exists", {
        email: values.email,
        businessId
      });
      
      const data = await response.json();
      setHasChecked(true);
      setCustomerExists(data.exists);
      setCustomerEmail(values.email);
      
      if (data.exists) {
        // If customer exists, call the callback with customer data
        onExistingCustomer(data.customer);
      } else {
        // If customer doesn't exist, pre-fill the email in the customer form
        customerForm.setValue("email", values.email);
      }
    } catch (error) {
      console.error("Error checking customer:", error);
      toast({
        title: "Error",
        description: "There was an error checking if you're an existing customer.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Handle new customer form submission
  const onSubmitNewCustomer = (values: CustomerFormValues) => {
    onNewCustomer(values);
  };

  // Reset the form to check a different email
  const handleReset = () => {
    setHasChecked(false);
    setCustomerExists(false);
    setCustomerEmail("");
    emailForm.reset();
    customerForm.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
        <CardDescription>
          {!hasChecked ? 
            "Please enter your email to check if you're an existing customer" : 
            customerExists ? 
              "Welcome back! We found your information in our system." : 
              "Please complete your information to continue booking"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasChecked ? (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onCheckEmail)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        {...field} 
                        type="email"
                        disabled={isChecking}
                      />
                    </FormControl>
                    <FormDescription>
                      We'll use this to check if you're an existing customer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </Form>
        ) : customerExists ? (
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-green-50 text-green-700 rounded-md">
              <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>We found your information! You can continue with your appointment booking.</p>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                Use Different Email
              </Button>
              <Button onClick={() => onExistingCustomer({ email: customerEmail })}>
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <Form {...customerForm}>
            <form onSubmit={customerForm.handleSubmit(onSubmitNewCustomer)} className="space-y-4">
              <div className="flex items-center p-4 mb-4 bg-blue-50 text-blue-700 rounded-md">
                <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>We couldn't find your information. Please fill in your details to continue.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={customerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your.email@example.com"
                        {...field}
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={customerForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Use Different Email
                </Button>
                <Button type="submit">
                  Continue
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}