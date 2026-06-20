Implement a WordPress-like theme system for a multi-tenant Next.js ERP application.

Requirements:

1. Themes must be selectable per tenant from the admin settings.
2. Each tenant stores an active theme identifier in the database.

Example:

tenant
- id
- name
- activeTheme

3. Themes should be organized in a dedicated directory structure:

themes/
├── corporate/
│   ├── layout.tsx
│   ├── header.tsx
│   ├── sidebar.tsx
│   ├── login.tsx
│   └── theme.config.ts
│
├── modern/
│   ├── layout.tsx
│   ├── header.tsx
│   ├── sidebar.tsx
│   ├── login.tsx
│   └── theme.config.ts
│
├── minimal/
│   ├── layout.tsx
│   ├── header.tsx
│   ├── sidebar.tsx
│   ├── login.tsx
│   └── theme.config.ts

4. Every theme must implement a common interface:

export interface ERPTheme {
Layout: React.ComponentType;
Header: React.ComponentType;
Sidebar: React.ComponentType;
LoginPage?: React.ComponentType;
themeConfig: ThemeConfig;
}

5. Create a theme loader that loads the active theme dynamically based on the tenant configuration.

Example:

const theme = await loadTheme(tenant.activeTheme);

return (
<theme.Layout>
{children}
</theme.Layout>
);

6. Include a theme manifest/config file containing metadata:

{
"name": "Modern Theme",
"version": "1.0.0",
"author": "Company Name",
"supportsDarkMode": true
}

7. The admin panel must provide a Theme Management page where users can:
    - View installed themes
    - Preview themes
    - Activate a theme
    - Configure theme-specific settings

8. Theme customization should be limited to:
    - Brand colors
    - Typography
    - Logo
    - Header layout
    - Sidebar layout
    - Dashboard widgets/layout
    - Login screen branding

9. Business-critical ERP screens must remain unchanged across themes:
    - Orders
    - Invoices
    - Inventory
    - Customers
    - Reports
    - Forms
    - Data tables

Themes may change appearance but must not alter business logic or workflows.

10. Design the architecture to support future:
- Premium themes
- Customer-specific themes
- Theme marketplace
- White-label deployments

11. Use Next.js App Router best practices, TypeScript, and a scalable plugin-like architecture that allows adding new themes without modifying core ERP code.