import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarRange, Clock, AlertCircle, CheckCircle } from "lucide-react";

export function AvailabilityHints() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Information</CardTitle>
        <CardDescription>
          Tips for scheduling your appointment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <CalendarRange className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium">Availability</h4>
            <p className="text-sm text-muted-foreground">
              We offer appointments Monday through Saturday. Sunday hours are by special arrangement only.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium">Duration</h4>
            <p className="text-sm text-muted-foreground">
              Please arrive 10 minutes before your scheduled appointment. Services begin and end on time to accommodate all clients.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h4 className="font-medium">Cancellation Policy</h4>
            <p className="text-sm text-muted-foreground">
              We kindly request 24 hours notice for cancellations. Late cancellations may incur a fee of 50% of the service price.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="font-medium">Confirmation</h4>
            <p className="text-sm text-muted-foreground">
              You'll receive a confirmation email after booking. We'll also send a reminder 24 hours before your appointment.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}