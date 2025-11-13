import SupabaseMFASetup from "@/components/features/admin/auth/Supabasemfasetup";
import Layout from "@/components/layout/Layout";

export default function AdminMFASetupPage() {
  return (
    <Layout>
      <div className="">
        <SupabaseMFASetup />
      </div>
    </Layout>
  );
}