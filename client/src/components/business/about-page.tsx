import { User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AboutPageProps {
  business: Omit<User, "password">;
  slug: string;
}

export default function AboutPage({ business, slug }: AboutPageProps) {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About {business.businessName}</h1>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Story</CardTitle>
              <CardDescription>Learn more about how we started</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                {business.businessName} was founded with a passion for providing exceptional beauty and wellness services to our community. 
                Since our establishment, we have been dedicated to delivering outstanding customer experiences that leave our clients feeling 
                refreshed, confident, and satisfied.
              </p>
              <p>
                Our team of skilled professionals is committed to staying at the forefront of the latest trends and techniques in beauty and wellness, 
                ensuring that every client receives the highest quality service tailored to their unique needs and preferences.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>What drives us every day</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                At {business.businessName}, our mission is to enhance the natural beauty and well-being of our clients through personalized, 
                professional services delivered in a welcoming and relaxing environment. We believe that everyone deserves to feel their best, 
                and we are dedicated to helping our clients achieve that feeling with every visit.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Meet Our Team</CardTitle>
              <CardDescription>The faces behind {business.businessName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-500">JD</span>
                  </div>
                  <h3 className="font-medium text-lg">John Davis</h3>
                  <p className="text-muted-foreground">Founder & Lead Stylist</p>
                </div>
                
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-500">SM</span>
                  </div>
                  <h3 className="font-medium text-lg">Sarah Miller</h3>
                  <p className="text-muted-foreground">Senior Stylist</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Visit Us</CardTitle>
              <CardDescription>Our location and hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-2">Address</h3>
                  <p className="text-muted-foreground mb-1">123 Main Street</p>
                  <p className="text-muted-foreground mb-1">Midtown, New York</p>
                  <p className="text-muted-foreground">USA</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Hours of Operation</h3>
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="text-muted-foreground">Monday - Friday</p>
                    <p>9:00 AM - 7:00 PM</p>
                    <p className="text-muted-foreground">Saturday</p>
                    <p>10:00 AM - 6:00 PM</p>
                    <p className="text-muted-foreground">Sunday</p>
                    <p>Closed</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Contact</h3>
                <p className="text-muted-foreground mb-1">Phone: {business.phone || "(555) 123-4567"}</p>
                <p className="text-muted-foreground">Email: contact@{business.businessSlug}.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}