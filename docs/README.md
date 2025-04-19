# Business Management System Documentation

Welcome to the comprehensive documentation for the Business Management System. This documentation provides detailed information about the system's architecture, components, and features.

## Documentation Sections

### Theme System Documentation

The [Theme System](./theme-system/README.md) documentation provides comprehensive information about our advanced theme customization engine:

- [Architecture Overview](./theme-system/01-architecture.md): Learn about the multi-tenant theme architecture
- [Design Tokens Reference](./theme-system/02-design-tokens.md): Detailed reference for all theme tokens
- [Component Integration Guide](./theme-system/03-component-integration.md): How to integrate components with the theme system
- [Theme Marketplace Guide](./theme-system/04-theme-marketplace.md): How to use the theme marketplace
- [Theme Customization Examples](./theme-system/05-theme-customization.md): Practical examples of theme customization
- [API Reference](./theme-system/06-api-reference.md): Technical reference for the theme system APIs
- [Best Practices & Performance](./theme-system/07-best-practices.md): Guidelines for working with themes effectively

The [Examples](./theme-system/examples/README.md) directory contains practical code samples that demonstrate how to use the theme system:

- [ThemeAwareButton](./theme-system/examples/ThemeAwareButton.tsx): Example of a theme-aware button component
- [ThemeAwareCard](./theme-system/examples/ThemeAwareCard.tsx): Example of a theme-aware card component
- [ThemeHooksExample](./theme-system/examples/ThemeHooksExample.tsx): Example of using theme-related hooks
- [ThemeMarketplaceExample](./theme-system/examples/ThemeMarketplaceExample.tsx): Example of theme marketplace integration

## Development Resources

### Environment Setup

For setting up the development environment, follow the instructions in the main [README.md](../README.md) file.

### API Documentation

API documentation is available in the [server/routes.ts](../server/routes.ts) file, with additional endpoint-specific logic in the `server/routes` directory.

### Database Schema

The database schema is defined in [shared/schema.ts](../shared/schema.ts), which uses Drizzle ORM for type-safe database access.

## Contributing to Documentation

If you'd like to contribute to this documentation:

1. Fork the repository
2. Make your changes
3. Submit a pull request

When adding new documentation:
- Place it in the appropriate section
- Follow the existing naming conventions
- Include practical examples where appropriate

## Questions and Support

If you have questions about the documentation or need additional information, please:

1. Check the existing documentation first
2. Look for related code comments in the source files
3. Contact the development team