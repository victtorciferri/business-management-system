import { format, isToday, isTomorrow, addDays, isThisWeek, isThisMonth, differenceInCalendarDays } from "date-fns";

// Helper for formatting dates in consistent manner
export function formatAppointmentDate(date: Date): string {
  if (isToday(date)) {
    return "Today";
  }
  
  if (isTomorrow(date)) {
    return "Tomorrow";
  }
  
  const daysFromNow = differenceInCalendarDays(date, new Date());
  
  if (daysFromNow > 0 && daysFromNow < 7) {
    return format(date, "EEEE"); // Day of week
  }
  
  if (isThisWeek(date)) {
    return `This ${format(date, "EEEE")}`;
  }
  
  if (isThisMonth(date)) {
    return format(date, "MMMM d");
  }
  
  return format(date, "MMMM d, yyyy");
}

// Helper for formatting time
export function formatAppointmentTime(date: Date): string {
  return format(date, "h:mm a");
}

// Helper for getting date range for queries
export function getDateRange(view: string, date: Date = new Date()) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  switch (view) {
    case "today":
      return { start: today, end: endOfDay };
    
    case "week":
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
      endOfWeek.setHours(23, 59, 59, 999);
      
      return { start: startOfWeek, end: endOfWeek };
      
    case "month":
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      
      return { start: startOfMonth, end: endOfMonth };
      
    case "custom":
      // Custom date range centered around the provided date
      const startOfCustomRange = new Date(date);
      startOfCustomRange.setDate(date.getDate() - 15);
      startOfCustomRange.setHours(0, 0, 0, 0);
      
      const endOfCustomRange = new Date(date);
      endOfCustomRange.setDate(date.getDate() + 15);
      endOfCustomRange.setHours(23, 59, 59, 999);
      
      return { start: startOfCustomRange, end: endOfCustomRange };
      
    default: // All upcoming
      return { start: today, end: new Date(2099, 11, 31) }; // Far future date
  }
}

// Define colors for different appointment services
// These colors match the design reference and provide visual distinction for different service types
export const appointmentColors = [
  {
    bg: "bg-primary-50",
    border: "border-primary-200",
    accent: "bg-primary-600",
    hoverBg: "bg-primary-100",
  },
  {
    bg: "bg-green-50",
    border: "border-green-200",
    accent: "bg-green-600",
    hoverBg: "bg-green-100",
  },
  {
    bg: "bg-purple-50",
    border: "border-purple-200",
    accent: "bg-purple-600",
    hoverBg: "bg-purple-100",
  },
  {
    bg: "bg-blue-50",
    border: "border-blue-200",
    accent: "bg-blue-600",
    hoverBg: "bg-blue-100",
  },
  {
    bg: "bg-orange-50",
    border: "border-orange-200",
    accent: "bg-orange-600",
    hoverBg: "bg-orange-100",
  },
  {
    bg: "bg-pink-50",
    border: "border-pink-200",
    accent: "bg-pink-600",
    hoverBg: "bg-pink-100",
  },
  {
    bg: "bg-amber-50",
    border: "border-amber-200",
    accent: "bg-amber-600",
    hoverBg: "bg-amber-100",
  }
];
