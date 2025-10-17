/*
This file is updated to use the redesigned `NotFound` component.
- The `Layout` component wraps the 404 page for consistent site structure (header/footer).
- All specific styling is now handled by the `not-found.tsx` component, which will be updated next.
*/
import Layout from "@/components/layout";
import NotFoundComponent from "@/components/not-found";

export default function Custom404Page() {
  return (
    <Layout>
      <NotFoundComponent />
    </Layout>
  );
}