import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, TrendingDown, TrendingUp } from "lucide-react";

type AvailabilityData = {
  hourlyCount: Record<string, number>;
  dayOfWeekCount: Record<string, number>;
  peakHours: number[];
  peakDays: string[];
  offPeakHours: number[];
  offPeakDays: string[];
  totalAppointments: number;
};

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
}

export function AvailabilityHints() {
  const { data, isLoading, error } = useQuery<AvailabilityData>({
    queryKey: ['/api/availability-analysis'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full mb-4" />
          <div className="flex gap-2 flex-wrap">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.totalAppointments === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Availability Information</CardTitle>
          <CardDescription>
            Tips to help you choose the perfect time slot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <TrendingDown className="h-4 w-4" />
            <AlertTitle>All times are currently available</AlertTitle>
            <AlertDescription>
              {data?.totalAppointments === 0 
                ? "No appointment data is available yet. All time slots should be open." 
                : "We couldn't load availability information. Please choose any time that works for you."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Smart Availability Guide
        </CardTitle>
        <CardDescription>
          Choose less busy times for quicker appointments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            Peak Hours (Busiest Times)
          </h4>
          <div className="flex flex-wrap gap-1">
            {data.peakHours.map(hour => (
              <Badge key={hour} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <Clock className="h-3 w-3 mr-1" />
                {formatHour(hour)}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <TrendingDown className="h-4 w-4 text-green-500" />
            Off-Peak Hours (Recommended)
          </h4>
          <div className="flex flex-wrap gap-1">
            {data.offPeakHours.map(hour => (
              <Badge key={hour} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Clock className="h-3 w-3 mr-1" />
                {formatHour(hour)}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Popular Days</h4>
          <div className="flex flex-wrap gap-1">
            {data.peakDays.map(day => (
              <Badge key={day} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {day}
              </Badge>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground pt-2">
          Based on analysis of {data.totalAppointments} previous appointments
        </div>
      </CardContent>
    </Card>
  );
}