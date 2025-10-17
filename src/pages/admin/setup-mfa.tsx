import SupabaseMFASetup from "@/components/admin/auth/SupabaseMFASetup";
import Layout from "@/components/layout";

export default function AdminMFASetupPage() {
  return (
    <Layout>
      <div className="font-space">
        <SupabaseMFASetup />
      </div>
    </Layout>
  );
}