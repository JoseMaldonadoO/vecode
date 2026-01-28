# Antigravity Context & Handover

This document serves as a context transfer for the `vecode` project. It summarizes the project state, workflows, user preferences, and recent history to ensure a smooth transition for the next AI agent.

## Project Overview
- **Name**: vecode
- **Stack**: Laravel (Backend), Inertia.js + React (Frontend), TypeScript, TailwindCSS.
- **Key Modules**:
    - **Sales (Comercialización)**: Managing Sales Orders (OV), Clients, Products.
    - **Scale (Báscula)**: Weighing operations, restrictions (e.g., Burreo).
    - **APT**: Port operations, scanned data.

## User Preferences & Rules (CRITICAL)
1.  **Git Workflow**:
    -   **ALWAYS run `git pull origin main`** before starting **ANY** task to sync with the latest code.
    -   **Deployment**: Deployment is automated via GitHub Actions when pushing to the `main` branch (`git push origin main`).
    -   **Never** leave the local repo out of sync.
2.  **Design Standards**:
    -   **Aesthetics**: "Premium", "Modern", "Dynamic". Use Indigo/Blue color schemes generally.
    -   **Animations**: Use smooth transitions (e.g., HeadlessUI Transition, Animate.css via SweetAlert classes).
    -   **Feedback**: Use SweetAlert2 (`Swal`) for success/error messages with high-quality styling.
3.  **Technical Constraints**:
    -   **Imports**: Use static `import Swal from 'sweetalert2'` instead of `require()`. The build system (Vite) is strict about ES Modules.
    -   **Printing**: When adjusting print layouts (e.g., `Show.tsx`), ensure they fit on a single page by using `print:hidden`, `print:p-4`, and removing fixed page sizes.

## Recent Work (Last Session)
- **Sales Orders (`Create.tsx`, `Edit.tsx`)**:
    -   Harmonized designs (gradients, cards).
    -   Added "Premium" success alerts with `Swal`.
    -   Fixed `require` vs `import` build error.
- **Sales Reports (`Show.tsx`, `Print.tsx`)**:
    -   Removed "Historial de Embarques" table.
    -   Updated domain to `www.pro-agroindustria.com` (hyphenated) and emails.
    -   Fixed "Ver" view to print on a single page (CSS adjustments).
- **Scale (`EntryMP.tsx`, `WeightTicketController.php`)**:
    -   Added restrictions for "Burreo" operations.

## Deployment Mechanics (Unicorn Level)
- **Strategy**: "Anti-Cache Artifacts". GitHub Actions builds a unique zip (`release_${run_number}.zip`), and a server-side script (`extract_debug.php`) unzips it, overwrites files, and aggressively clears caches (Laravel + Opcache).
- **Trigger**: Push to `main`.
- **Environment**:
    -   **DB**: Hostinger `u174025152_vecode` (User: `u174025152_admin`).
    -   **Domain**: Root `pro-agroindustria.com`.
    -   **Secrets**: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` must be set in GitHub.
- **Troubleshooting**:
    -   **Build Failures**: Check for `require` usage (must use `import`).
    -   **Images Broken**: Regenerate symlink by creating `public/link.php` (see `GUIA_DESPLIEGUE.md`).
    -   **Cache Issues**: The deployment script handles this, but you can manually trigger `php artisan optimize:clear` via SSH or a route if needed.

## Next Steps
- Continue maintaining the "Premium" look and feel.
- Ensure all new features follow the established patterns in `DashboardLayout`.
- Refer to `GUIA_DESPLIEGUE.md` for full deployment details if needed.
