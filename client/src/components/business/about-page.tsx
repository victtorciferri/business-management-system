import { User } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CalendarDays,
  Users
} from "lucide-react";

interface AboutPageProps {
  business: Omit<User, "password">;
  slug: string;
}

export default function AboutPage({ business, slug }: AboutPageProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">About Us</h1>
      <p className="text-gray-600 mb-8">Get to know {business.businessName} and our services</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <div className="prose">
            <p>
              Welcome to {business.businessName}, where we are dedicated to providing exceptional services tailored to your needs. 
              Our journey began with a simple vision: to create a space where clients feel valued, heard, and transformed.
            </p>
            <p>
              With years of experience and a passion for excellence, we've built a reputation for quality service and client satisfaction.
              Our team of professionals is committed to delivering the best experience possible for every client who walks through our doors.
            </p>
            <p>
              We believe in continuous improvement and staying up-to-date with the latest trends and techniques in our industry.
              This dedication to growth enables us to offer you innovative solutions and outstanding results.
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-4xl font-bold text-primary-600">
                {business.businessName?.substring(0, 1).toUpperCase() || "B"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-primary-800">{business.businessName}</h3>
            <p className="text-primary-700 mt-1">Established 2023</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-500" />
              Our Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Our team consists of experienced professionals dedicated to providing the best service possible.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary-500" />
              Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Monday - Friday</span>
                <span>9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span>10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CalendarDays className="w-5 h-5 mr-2 text-primary-500" />
              Booking Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Book appointments online or contact us directly. We recommend scheduling at least 24 hours in advance.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {business.phone && (
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-primary-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-gray-600">{business.phone}</p>
                  </div>
                </div>
              )}
              
              {business.email && (
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-primary-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-gray-600">{business.email}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-primary-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p className="text-gray-600">123 Business St, Santiago, Chile</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-4 h-48 flex items-center justify-center">
              <p className="text-gray-500 text-center">
                Map will be displayed here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}