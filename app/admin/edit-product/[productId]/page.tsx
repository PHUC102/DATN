import { Container } from "@/components/ui/container";
import { FormWrap } from "@/components/ui/form-wrap";
import { getCurrentUser } from "@/actions/get-current-user";
import { AccessDenied } from "@/components/access-denied";
import { EditProductForm } from "../components/edit-product-form";
import getProductById from "@/actions/get-product-by-id";

interface EditProductPageParams {
  productId: string;
}

export default async function EditProductsPage({
  params,
}: {
  params: EditProductPageParams;
}) {
  const currentUser = await getCurrentUser();
  const product = await getProductById(params);

  if (!currentUser || currentUser.role !== "ADMIN") {
    return <AccessDenied title="Truy cập bị từ chối" />;
  }

  return (
    <div className="p-8">
      <Container>
        <FormWrap>
          <EditProductForm product={product} />
        </FormWrap>
      </Container>
    </div>
  );
}
