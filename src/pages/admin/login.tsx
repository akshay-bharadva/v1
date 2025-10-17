import SupabaseLogin from "@/components/admin/auth/SupabaseLogin";
import Layout from "@/components/layout";

export default function AdminLoginPage() {
  return (
    <Layout>
      <div className="font-space">
        <SupabaseLogin />
      </div>
    </Layout>
  );
}