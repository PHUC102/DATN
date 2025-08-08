import { Container } from "@/components/ui/container";
import { ManageProductClient } from "./components/client";
import getProducts from "@/actions/get-products";
import { getCurrentUser } from "@/actions/get-current-user";
import { AccessDenied } from "@/components/access-denied";

export default async function ManageProductsPage() {
  const products = await getProducts({ category: null });
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return <AccessDenied title="Truy cập bị từ chối" />;
  }
  return (
    <div>
      <Container>
        <ManageProductClient products={products} />
      </Container>
    </div>
  );
}
