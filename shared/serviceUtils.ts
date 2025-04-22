/**
 * Utility functions for services, particularly for class booking capacity checks
 */

import { Service, Appointment } from './schema';
import { format, parseISO } from 'date-fns';

/**
 * Checks if a service has remaining capacity for a given date and time
 * 
 * @param service The service to check capacity for
 * @param appointments Array of existing appointments
 * @param date The appointment date to check (ISO string or Date object)
 * @returns Object containing available status and counts
 */
export async function checkServiceAvailability(
  service: Service, 
  appointments: Appointment[],
  date: string | Date
): Promise<{
  available: boolean;
  capacity: number;
  booked: number;
  remaining: number;
}> {
  // For individual appointments, always return available
  if (service.serviceType === 'individual' || !service.capacity || service.capacity <= 1) {
    return {
      available: true,
      capacity: 1,
      booked: 0,
      remaining: 1
    };
  }

  // Parse date if it's a string
  const appointmentDate = typeof date === 'string' ? parseISO(date) : date;
  
  // Format the date to compare only the date and hour (ignoring minutes for class comparison)
  const dateTimeString = format(appointmentDate, 'yyyy-MM-dd HH:00');
  
  // Count how many appointments exist for this service on this specific date and hour
  const existingAppointmentsCount = appointments.filter(appointment => {
    // Parse the appointment date
    const appDate = typeof appointment.date === 'string' 
      ? parseISO(appointment.date)
      : appointment.date;
    
    // Check if this appointment is for the same service and same hour
    return (
      appointment.serviceId === service.id &&
      format(appDate, 'yyyy-MM-dd HH:00') === dateTimeString &&
      appointment.status !== 'cancelled'
    );
  }).length;
  
  // Calculate availability
  const remaining = service.capacity - existingAppointmentsCount;
  
  return {
    available: remaining > 0,
    capacity: service.capacity,
    booked: existingAppointmentsCount,
    remaining: remaining
  };
}