import { StatCard } from "./stat-card";
import { CalendarClock, DollarSign, Users, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Appointment } from "@shared/schema";
import { Link } from "wouter";

interface StatsOverviewProps {
  userId: number;
}

export function StatsOverview({ userId }: StatsOverviewProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Fetch all appointments
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments?userId=${userId}`],
  });

  // Calculate today's appointments
  const todayAppointments = appointments.filter(
    (appointment) => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= today && appointmentDate <= endOfDay;
    }
  );

  // Calculate pending appointments
  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled"
  );

  // Format stats
  const stats = {
    todayCount: todayAppointments.length,
    weeklyRevenue: appointments
      .filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return (
          appointmentDate >= startOfWeek && 
          appointmentDate <= endOfWeek && 
          appointment.paymentStatus === "paid"
        );
      })
      .reduce((sum, appointment) => sum + 0, 0)
      .toFixed(2), // In a real app, this would calculate from actual payment data
    newCustomers: 12, // This would be calculated from actual customer data
    pendingCount: pendingAppointments.length
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <StatCard
        title="Today's Appointments"
        value={stats.todayCount}
        icon={CalendarClock}
        iconBgColor="bg-primary-100"
        iconColor="text-primary-600"
        linkText="View all"
        linkHref="/appointments"
      />
      
      <StatCard
        title="Weekly Revenue"
        value={`$${stats.weeklyRevenue}`}
        icon={DollarSign}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        linkText="View report"
        linkHref="/reports"
      />
      
      <StatCard
        title="New Customers (This Month)"
        value={stats.newCustomers}
        icon={Users}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        linkText="View all"
        linkHref="/customers"
      />
      
      <StatCard
        title="Pending Appointments"
        value={stats.pendingCount}
        icon={Clock}
        iconBgColor="bg-amber-100"
        iconColor="text-amber-600"
        linkText="Confirm all"
        linkHref="/appointments"
      />
    </div>
  );
}
