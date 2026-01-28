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

## Deployment Mechanics
- The deployment is triggered by a push to `main`.
- The GitHub Action runs `npm run build`.
- If the build fails, check for CommonJS (`require`) usage in TSX files.

## Next Steps
- Continue maintaining the "Premium" look and feel.
- Ensure all new features follow the established patterns in `DashboardLayout`.
