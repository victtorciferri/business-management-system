/**
 * Appointment validation utilities for preventing double-booking
 */

import { storage } from "../storage";

export interface AppointmentConflictCheck {
  staffId: number;
  date: Date;
  duration: number;
  excludeAppointmentId?: number;
}

/**
 * Check if a new appointment conflicts with existing appointments for the same staff member
 * @param appointmentCheck - The appointment details to check
 * @returns Promise<boolean> - true if there's a conflict, false if slot is available
 */
export async function hasAppointmentConflict(appointmentCheck: AppointmentConflictCheck): Promise<boolean> {
  const { staffId, date, duration, excludeAppointmentId } = appointmentCheck;
  
  // Get all appointments for this staff member on the same date
  const staffAppointments = await storage.getStaffAppointments(staffId);
  
  // Filter to same day and exclude the current appointment if editing
  const appointmentDate = new Date(date);
  const dayStart = new Date(appointmentDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(appointmentDate);
  dayEnd.setHours(23, 59, 59, 999);
  
  const conflictingAppointments = staffAppointments.filter(appointment => {
    // Exclude cancelled appointments
    if (appointment.status === 'cancelled') {
      return false;
    }
    
    // Exclude the current appointment if we're editing
    if (excludeAppointmentId && appointment.id === excludeAppointmentId) {
      return false;
    }
    
    const existingDate = new Date(appointment.date);
    
    // Only check appointments on the same day
    return existingDate >= dayStart && existingDate <= dayEnd;
  });
  
  // Calculate the proposed appointment's end time
  const proposedStart = new Date(date);
  const proposedEnd = new Date(proposedStart.getTime() + (duration * 60000)); // duration in minutes
  
  // Check for time conflicts with existing appointments
  for (const existingAppointment of conflictingAppointments) {
    const existingStart = new Date(existingAppointment.date);
    const existingEnd = new Date(existingStart.getTime() + (existingAppointment.duration * 60000));
    
    // Check if there's any overlap between the time slots
    const hasOverlap = (
      // New appointment starts during existing appointment
      (proposedStart >= existingStart && proposedStart < existingEnd) ||
      // New appointment ends during existing appointment  
      (proposedEnd > existingStart && proposedEnd <= existingEnd) ||
      // New appointment encompasses existing appointment
      (proposedStart <= existingStart && proposedEnd >= existingEnd)
    );
    
    if (hasOverlap) {
      console.log(`⚠️  Appointment conflict detected:`, {
        staffId,
        proposedTime: `${proposedStart.toISOString()} - ${proposedEnd.toISOString()}`,
        conflictingAppointment: {
          id: existingAppointment.id,
          time: `${existingStart.toISOString()} - ${existingEnd.toISOString()}`
        }
      });
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a staff member is available at a specific date and time based on their availability schedule
 * @param staffId - The staff member ID
 * @param date - The appointment date and time
 * @param duration - The appointment duration in minutes
 * @returns Promise<boolean> - true if staff is available, false otherwise
 */
export async function isStaffAvailable(staffId: number, date: Date, duration: number): Promise<boolean> {
  try {
    // Get staff availability for the day of the week
    const staffAvailability = await storage.getStaffAvailability(staffId);
    
    if (!staffAvailability || staffAvailability.length === 0) {
      console.log(`⚠️  No availability schedule found for staff ${staffId}`);
      return false; // No availability schedule means not available
    }
    
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Find availability for this day of the week
    const dayAvailability = staffAvailability.find(avail => avail.dayOfWeek === dayOfWeek);
    
    if (!dayAvailability) {
      console.log(`⚠️  Staff ${staffId} not available on day ${dayOfWeek}`);
      return false; // Staff doesn't work on this day
    }
    
    // Parse availability times
    const [startHour, startMinute] = dayAvailability.startTime.split(':').map(Number);
    const [endHour, endMinute] = dayAvailability.endTime.split(':').map(Number);
    
    // Create availability window for the appointment date
    const availabilityStart = new Date(appointmentDate);
    availabilityStart.setHours(startHour, startMinute, 0, 0);
    
    const availabilityEnd = new Date(appointmentDate);
    availabilityEnd.setHours(endHour, endMinute, 0, 0);
    
    // Calculate appointment end time
    const appointmentStart = new Date(date);
    const appointmentEnd = new Date(appointmentStart.getTime() + (duration * 60000));
    
    // Check if appointment fits within availability window
    const isWithinHours = (
      appointmentStart >= availabilityStart &&
      appointmentEnd <= availabilityEnd
    );
    
    if (!isWithinHours) {
      console.log(`⚠️  Appointment outside staff availability:`, {
        staffId,
        appointmentTime: `${appointmentStart.toISOString()} - ${appointmentEnd.toISOString()}`,
        availabilityWindow: `${availabilityStart.toISOString()} - ${availabilityEnd.toISOString()}`
      });
    }
    
    return isWithinHours;
  } catch (error) {
    console.error(`❌ Error checking staff availability for staff ${staffId}:`, error);
    return false; // Default to not available on error
  }
}

/**
 * Comprehensive validation for appointment booking including conflicts and availability
 * @param appointmentData - The appointment details to validate
 * @returns Promise<{ isValid: boolean, error?: string }> - Validation result
 */
export async function validateAppointmentBooking(appointmentData: {
  staffId: number;
  date: Date;
  duration: number;
  excludeAppointmentId?: number;
}): Promise<{ isValid: boolean; error?: string }> {
  const { staffId, date, duration, excludeAppointmentId } = appointmentData;
  
  try {
    // Check if staff member exists
    const staff = await storage.getUser(staffId);
    if (!staff) {
      return { isValid: false, error: "Staff member not found" };
    }
    
    // Check if staff is available at this time based on their schedule
    const isAvailable = await isStaffAvailable(staffId, date, duration);
    if (!isAvailable) {
      return { 
        isValid: false, 
        error: "Staff member is not available at the requested time" 
      };
    }
    
    // Check for appointment conflicts
    const hasConflict = await hasAppointmentConflict({
      staffId,
      date,
      duration,
      excludeAppointmentId
    });
    
    if (hasConflict) {
      return { 
        isValid: false, 
        error: "This time slot is already booked. Please select a different time." 
      };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error("❌ Error validating appointment booking:", error);
    return { 
      isValid: false, 
      error: "Unable to validate appointment booking. Please try again." 
    };
  }
}
