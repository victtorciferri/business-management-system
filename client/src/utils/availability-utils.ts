import { Appointment, StaffAvailability } from "@shared/schema";
import { RRule } from "rrule";
import { format, parse, isWithinInterval, addMinutes, isSameDay, setHours, setMinutes, isAfter, isBefore } from "date-fns";

// Type for breaks that isn't in the schema yet but used in the UI
export interface BreakTime {
  startTime: string;
  endTime: string;
}

// Extended availability with breaks
export interface ExtendedStaffAvailability extends StaffAvailability {
  breaks?: BreakTime[];
}

// Map numeric day of week to day name
export function getDayNameFromDayOfWeek(dayOfWeek: number): string {
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return dayNames[dayOfWeek];
}

// Map day name to numeric day of week
export function getDayOfWeekFromDayName(dayName: string): number {
  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  return dayMap[dayName.toLowerCase()] || 0;
}

// Function to convert staff availability to RRule
export function createAvailabilityRRule(availability: StaffAvailability): RRule {
  // For now, due to TypeScript issues with RRule, we'll use a simpler approach
  // Work with the numeric day value directly
  
  // Parse start and end time
  const startTimeParts = availability.startTime.split(':').map(part => parseInt(part, 10));
  const endTimeParts = availability.endTime.split(':').map(part => parseInt(part, 10));

  // Create a rule that represents the weekly recurring availability
  const ruleOptions = {
    freq: RRule.WEEKLY,
    byweekday: availability.dayOfWeek, // RRule accepts numbers directly
    dtstart: new Date(Date.UTC(2023, 0, 1, startTimeParts[0], startTimeParts[1], 0)),
    until: new Date(Date.UTC(2030, 11, 31, endTimeParts[0], endTimeParts[1], 0))
  };

  return new RRule(ruleOptions);
}

// Check if a specific date and time falls within staff availability
export function isTimeWithinAvailability(
  date: Date,
  time: string,
  duration: number,
  availabilities: (StaffAvailability | ExtendedStaffAvailability)[]
): boolean {
  // Parse the appointment time
  const [hours, minutes] = time.split(':').map(Number);
  const appointmentDate = new Date(date);
  appointmentDate.setHours(hours, minutes, 0, 0);
  
  // Calculate the end time of the appointment
  const appointmentEndDate = addMinutes(appointmentDate, duration);
  
  // Get the day of the week as a number (0-6, where 0 is Sunday)
  const appointmentDayOfWeek = date.getDay();
  
  // Find the staff availability for this day
  const dayAvailability = availabilities.find(a => a.dayOfWeek === appointmentDayOfWeek);
  
  if (!dayAvailability) return false;
  
  // Parse the availability times
  const availabilityStart = parse(dayAvailability.startTime, 'HH:mm', new Date());
  const availabilityEnd = parse(dayAvailability.endTime, 'HH:mm', new Date());
  
  // Set the availability times to the same date as the appointment
  const availabilityStartDate = setHours(
    setMinutes(date, availabilityStart.getMinutes()),
    availabilityStart.getHours()
  );
  
  const availabilityEndDate = setHours(
    setMinutes(date, availabilityEnd.getMinutes()),
    availabilityEnd.getHours()
  );
  
  // Check if the appointment time falls within the staff availability
  const isWithinAvailabilityTime = 
    (isAfter(appointmentDate, availabilityStartDate) || appointmentDate.getTime() === availabilityStartDate.getTime()) && 
    (isBefore(appointmentEndDate, availabilityEndDate) || appointmentEndDate.getTime() === availabilityEndDate.getTime());
  
  // If the staff member has breaks, check if the appointment overlaps with any break
  const extendedAvailability = dayAvailability as ExtendedStaffAvailability;
  if (extendedAvailability.breaks && extendedAvailability.breaks.length > 0) {
    for (const breakTime of extendedAvailability.breaks) {
      const breakStart = parse(breakTime.startTime, 'HH:mm', new Date());
      const breakEnd = parse(breakTime.endTime, 'HH:mm', new Date());
      
      const breakStartDate = setHours(
        setMinutes(date, breakStart.getMinutes()), 
        breakStart.getHours()
      );
      
      const breakEndDate = setHours(
        setMinutes(date, breakEnd.getMinutes()),
        breakEnd.getHours()
      );
      
      // Check if appointment overlaps with break
      const overlapsWithBreak = (
        (isAfter(appointmentDate, breakStartDate) || appointmentDate.getTime() === breakStartDate.getTime()) && 
        isBefore(appointmentDate, breakEndDate)
      ) || (
        isAfter(appointmentEndDate, breakStartDate) && 
        (isBefore(appointmentEndDate, breakEndDate) || appointmentEndDate.getTime() === breakEndDate.getTime())
      ) || (
        isBefore(appointmentDate, breakStartDate) && 
        isAfter(appointmentEndDate, breakEndDate)
      );
      
      if (overlapsWithBreak) {
        return false;
      }
    }
  }
  
  return isWithinAvailabilityTime;
}

// Check if a time slot conflicts with existing appointments
export function isTimeSlotAvailable(
  date: Date,
  time: string,
  duration: number,
  existingAppointments: Appointment[],
  excludeAppointmentId?: number
): boolean {
  // Parse the proposed appointment time
  const [hours, minutes] = time.split(':').map(Number);
  const appointmentDate = new Date(date);
  appointmentDate.setHours(hours, minutes, 0, 0);
  
  // Calculate the end time of the appointment
  const appointmentEndDate = addMinutes(appointmentDate, duration);
  
  // Filter appointments for the same day
  const appointmentsOnSameDay = existingAppointments.filter(
    appointment => {
      const appointmentDate = new Date(appointment.date);
      return isSameDay(appointmentDate, date) && 
        (!excludeAppointmentId || appointment.id !== excludeAppointmentId);
    }
  );
  
  // Check for conflicts with existing appointments
  for (const existingAppointment of appointmentsOnSameDay) {
    const existingStart = new Date(existingAppointment.date);
    const existingEnd = addMinutes(existingStart, existingAppointment.duration);
    
    // Check if the new appointment overlaps with the existing one
    const hasOverlap = (
      (isAfter(appointmentDate, existingStart) || appointmentDate.getTime() === existingStart.getTime()) && 
      isBefore(appointmentDate, existingEnd)
    ) || (
      isAfter(appointmentEndDate, existingStart) && 
      (isBefore(appointmentEndDate, existingEnd) || appointmentEndDate.getTime() === existingEnd.getTime())
    ) || (
      isBefore(appointmentDate, existingStart) && 
      isAfter(appointmentEndDate, existingEnd)
    );
    
    if (hasOverlap) {
      return false;
    }
  }
  
  return true;
}

// Generate available time slots based on staff availability and existing appointments
export function generateAvailableTimeSlots(
  date: Date,
  availabilities: StaffAvailability[],
  existingAppointments: Appointment[],
  serviceDuration: number,
  interval: number = 15 // Default to 15-minute intervals
): string[] {
  // Get the day of the week as a number (0-6, where 0 is Sunday)
  const dayOfWeekNum = date.getDay();
  
  // Find the staff availability for this day
  const dayAvailability = availabilities.find(a => a.dayOfWeek === dayOfWeekNum);
  
  if (!dayAvailability) return [];
  
  // Parse the availability times
  const [startHour, startMinute] = dayAvailability.startTime.split(':').map(Number);
  const [endHour, endMinute] = dayAvailability.endTime.split(':').map(Number);
  
  // Create a date object for the start and end times
  const availabilityStart = new Date(date);
  availabilityStart.setHours(startHour, startMinute, 0, 0);
  
  const availabilityEnd = new Date(date);
  availabilityEnd.setHours(endHour, endMinute, 0, 0);
  
  // Generate time slots at specified intervals
  const timeSlots: string[] = [];
  let currentSlot = new Date(availabilityStart);
  
  while (currentSlot.getTime() + serviceDuration * 60000 <= availabilityEnd.getTime()) {
    const timeString = format(currentSlot, 'HH:mm');
    
    // Check if this time slot is available (not during a break and doesn't conflict with existing appointments)
    if (
      isTimeWithinAvailability(date, timeString, serviceDuration, [dayAvailability]) &&
      isTimeSlotAvailable(date, timeString, serviceDuration, existingAppointments)
    ) {
      timeSlots.push(timeString);
    }
    
    // Move to the next time slot
    currentSlot = addMinutes(currentSlot, interval);
  }
  
  return timeSlots;
}

// Get available days based on staff availability (for a range of dates)
export function getAvailableDays(
  startDate: Date,
  endDate: Date,
  staffAvailabilities: StaffAvailability[]
): Date[] {
  const availableDays: Date[] = [];
  const currentDate = new Date(startDate);
  
  // Create a set of days of the week where the staff is available
  const availableDaysOfWeek = new Set(
    staffAvailabilities.map(a => a.dayOfWeek)
  );
  
  // Iterate through the date range
  while (currentDate <= endDate) {
    const dayOfWeekNum = currentDate.getDay();
    
    // Check if the staff works on this day of the week
    if (availableDaysOfWeek.has(dayOfWeekNum)) {
      availableDays.push(new Date(currentDate));
    }
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return availableDays;
}