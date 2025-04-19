# Theme System Architecture

## System Architecture Overview

The theme system is built on a multi-layered architecture that enables flexible, scalable theme management across multiple tenants (businesses).

```
┌───────────────────────────────────────────────────────────┐
│                  Application Architecture                  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────────┐     ┌────────────────┐                 │
│  │   Frontend    │     │    Backend     │                 │
│  │  Components   │     │    Services    │                 │
│  └───────┬───────┘     └────────┬───────┘                 │
│          │                      │                         │
│  ┌───────▼───────┐     ┌────────▼───────┐                 │
│  │ Theme Context │     │  Theme API     │                 │
│  │   Providers   │     │  Endpoints     │                 │
│  └───────┬───────┘     └────────┬───────┘                 │
│          │                      │                         │
│  ┌───────▼───────┐     ┌────────▼───────┐                 │
│  │ Design Token  │     │  Theme Storage │                 │
│  │ Transformers  │     │     Layer      │                 │
│  └───────┬───────┘     └────────┬───────┘                 │
│          │                      │                         │
│  ┌───────▼───────────────────────▼───────┐                │
│  │           Database Layer             │                │
│  │       (PostgreSQL with Drizzle)       │                │
│  └───────────────────────────────────────┘                │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## Key Architectural Components

### 1. Theme Provider Hierarchy

The theme system uses a hierarchical provider structure to manage themes at different levels:

```
┌────────────────────────────────────────┐
│        GlobalThemeProvider             │
│  (App-wide default themes & settings)  │
│                  │                     │
│        ┌─────────▼──────────┐          │
│        │MultiTenantProvider │          │
│        │ (Business-specific │          │
│        │      themes)       │          │
│        │         │          │          │
│        │  ┌──────▼───────┐  │          │
│        │  │ThemeProvider │  │          │
│        │  │(Entry point) │  │          │
│        │  └──────────────┘  │          │
│        └────────────────────┘          │
└────────────────────────────────────────┘
```

- **GlobalThemeProvider**: Manages app-wide theme settings and defaults
- **MultiTenantThemeProvider**: Handles business-specific theme customizations
- **ThemeProvider**: Entry point for component theme consumption

### 2. CSS Variable Architecture

The theme system uses CSS variables for dynamic theme application, with a structured naming convention:

```css
/* Global theme variables */
:root {
  --theme-colors-primary-DEFAULT: #4f46e5;
  --theme-colors-primary-foreground: #ffffff;
  /* ... more variables ... */
}

/* Business-specific theme variables */
.theme-business-123 {
  --theme-colors-primary-DEFAULT: #0ea5e9;
  --theme-colors-primary-foreground: #ffffff;
  /* ... business-specific overrides ... */
}

/* Dark mode variants */
.dark {
  --theme-colors-primary-DEFAULT: #8b5cf6;
  --theme-colors-background-DEFAULT: #1f2937;
  /* ... dark mode overrides ... */
}
```

### 3. Database Schema

Themes are stored in the PostgreSQL database with the following schema structure:

```
┌────────────────────┐
│       themes       │
├────────────────────┤
│ id                 │
│ businessId         │
│ businessSlug       │
│ name               │
│ description        │
│ isActive           │
│ isDefault          │
│ tokens (JSON)      │
│ baseThemeId        │
│ category           │
│ tags               │
│ preview            │
│ thumbnail          │
│ popularity         │
│ logoImageUrl       │
│ createdAt          │
│ updatedAt          │
└────────────────────┘
```

The `tokens` field contains a structured JSON object with the complete design token system, following the `DesignTokens` interface defined in `shared/designTokens.ts`.

### 4. Data Flow

1. Themes are stored in the PostgreSQL database
2. The backend loads themes via the Theme Storage Layer
3. Theme data is exposed through Theme API Endpoints
4. Frontend fetches theme data and processes it with Design Token Transformers
5. Theme Context Providers make themes available to components
6. Components consume theme data through hooks and CSS variables

## Multi-tenant Isolation

Business themes are isolated through CSS class-based namespacing:

1. Each business gets a unique class: `.theme-{businessId}` or `.theme-{businessSlug}`
2. CSS variables are scoped to this class
3. The appropriate class is applied to the root element based on the current business context
4. Components consume variables from the current scope

This architecture ensures that themes never "leak" between different businesses, maintaining complete visual isolation while sharing the same codebase.