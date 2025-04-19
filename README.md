# Business Management System

A comprehensive business management system for small service-based businesses in Chile.

## Features

- **Dashboard**: View business statistics and upcoming appointments
- **Customers**: Manage customer information and history
- **Services**: Manage service offerings with pricing and duration
- **Appointments**: Schedule and track customer appointments
- **Payments**: Process payments through Mercadopago
- **Email Notifications**: Send reminders for upcoming appointments
- **Advanced Theme System**: Comprehensive design token system for complete customization

## Tech Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS, and shadcn UI
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js for user authentication
- **API**: RESTful API endpoints for data access
- **Payment Processing**: Mercadopago integration
- **Theme Engine**: CSS variable-based design token system with multi-tenant support

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/business-management-system.git
   cd business-management-system
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

4. Push database schema
   ```bash
   npm run db:push
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

## Project Structure

- `client/`: Frontend React application
  - `src/components/`: UI components
  - `src/pages/`: Application pages
  - `src/hooks/`: Custom hooks
  - `src/lib/`: Utility functions
  - `src/providers/`: Context providers including theme providers
- `server/`: Backend Express application
  - `routes.ts`: API endpoints
  - `storage.ts`: Data access interface
  - `databaseStorage.ts`: Database implementation 
  - `seed.ts`: Database seeding
- `shared/`: Shared code between frontend and backend
  - `schema.ts`: Database schema and types
  - `designTokens.ts`: Theme system token definitions
  - `themePresets.ts`: Pre-defined theme options
  - `marketplaceThemes.ts`: Theme marketplace definitions
- `docs/`: Project documentation
  - `theme-system/`: Comprehensive theme system documentation
    - Architecture diagrams
    - Component integration guides
    - API references
    - Best practices
    - Code examples

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Drizzle ORM](https://orm.drizzle.team/) for the database ORM
- [Tailwind CSS](https://tailwindcss.com/) for styling