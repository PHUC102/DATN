import { Container } from "@/components/ui/container";
import { ProductDetails } from "../components/product-details";
import getProductById from "@/actions/get-product-by-id";
import { AccessDenied } from "@/components/access-denied";
import ListRating from "../components/ListRating";
import AddRating from "../components/AddRating";
import { getCurrentUser } from "@/actions/get-current-user";
interface ProductPageParams {
  productId: string;
}

export default async function ProductPage({
  params,
}: {
  params: ProductPageParams;
}) {
  const product = await getProductById(params);
  const user = await getCurrentUser()
  if (!product) {
    return <AccessDenied title="Không tìm thấy sản phẩm.." />;
  }

  return (
    <div className="m-8">
      <Container>
        <ProductDetails product={product} />
        <div className="flex flex-col mt-20 gap-4">
          <AddRating product={product} user={user} />
          <ListRating product={product} />
        </div>
      </Container>
    </div>
  );
}
