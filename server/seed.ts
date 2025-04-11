import { db } from "./db";
import { users, services, customers, appointments } from "@shared/schema";
import { sql } from "drizzle-orm";

// This function is used to seed the database with initial data
export async function seedDatabase() {
  console.log("Seeding database...");
  
  try {
    // Check if users table has data
    const userCount = await db.select({
      count: sql<string>`count(*)`
    }).from(users);
    
    if (userCount[0].count === '0') {
      console.log("Seeding users...");
      // Create a test user
      await db.insert(users).values({
        username: "businessowner",
        email: "owner@example.com",
        password: "password123", // In a real app, this would be hashed
        businessName: "Salon Elegante",
        phone: "+56 9 9876 5432",
      });
    }
    
    // Check if services table has data
    const serviceCount = await db.select({
      count: sql<string>`count(*)`
    }).from(services);
    
    if (serviceCount[0].count === '0') {
      console.log("Seeding services...");
      // Add sample services for testing
      await db.insert(services).values([
        {
          userId: 1,
          name: "Haircut & Style",
          description: "Professional haircut and styling",
          duration: 45,
          price: "50",
          color: "#06b6d4",
          active: true
        },
        {
          userId: 1,
          name: "Men's Grooming",
          description: "Haircut and beard trim",
          duration: 30,
          price: "35",
          color: "#22c55e",
          active: true
        },
        {
          userId: 1,
          name: "Color & Highlights",
          description: "Hair coloring and highlights",
          duration: 90,
          price: "120",
          color: "#8b5cf6",
          active: true
        }
      ]);
    }
    
    // Check if customers table has data
    const customerCount = await db.select({
      count: sql<string>`count(*)`
    }).from(customers);
    
    if (customerCount[0].count === '0') {
      console.log("Seeding customers...");
      // Add sample customers for testing
      await db.insert(customers).values([
        {
          userId: 1,
          firstName: "Maria",
          lastName: "González",
          email: "maria@example.com",
          phone: "+56 9 1234 5678",
          notes: "Regular client, prefers appointments in the afternoon"
        },
        {
          userId: 1,
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan@example.com",
          phone: "+56 9 8765 4321",
          notes: "Allergic to certain hair products"
        },
        {
          userId: 1,
          firstName: "Camila",
          lastName: "Silva",
          email: "camila@example.com",
          phone: "+56 9 2468 1357",
          notes: ""
        }
      ]);
    }
    
    // Check if appointments table has data
    const appointmentCount = await db.select({
      count: sql<string>`count(*)`
    }).from(appointments);
    
    if (appointmentCount[0].count === '0') {
      console.log("Seeding appointments...");
      // Add sample appointments for testing
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(14, 30, 0, 0);
      
      await db.insert(appointments).values([
        {
          userId: 1,
          customerId: 1,
          serviceId: 1,
          date: tomorrow,
          duration: 45,
          status: "scheduled",
          notes: "",
          reminderSent: false,
          paymentStatus: "pending"
        },
        {
          userId: 1,
          customerId: 2,
          serviceId: 3,
          date: nextWeek,
          duration: 90,
          status: "scheduled",
          notes: "First time getting highlights",
          reminderSent: false,
          paymentStatus: "pending"
        }
      ]);
    }
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}