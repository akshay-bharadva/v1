/*
This file is updated for the new design system.
- The `font-space` class is removed, inheriting the global `font-sans`.
- The `Layout` component now wraps the page, providing a consistent structure.
- All specific styling is handled within the `SupabaseMFASetup` component, which has been redesigned to match the new theme.
*/
import SupabaseMFASetup from "@/components/admin/auth/SupabaseMFASetup";
import Layout from "@/components/layout";

export default function AdminMFASetupPage() {
  return (
    <Layout>
      <div>
        <SupabaseMFASetup />
      </div>
    </Layout>
  );
}