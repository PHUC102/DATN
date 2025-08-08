import { Fragment } from "react";
import { Banner } from "@/components/banner";
import { ProductCard } from "@/app/product/components/product-card";
import getProducts from "@/actions/get-products";
import { AccessDenied } from "@/components/access-denied";

export default async function Home(data: any) {
  const { params } = data;
  const { category } = params;

  const products = await getProducts({
    category: category === "All" ? null : category,
  });

  const productsFiltered = products.filter((product) => {
    if (category === "All") {
      return product;
    } else {
      return product.category === category;
    }
  });

  if (productsFiltered.length === 0) {
    return (
      <AccessDenied title="Không tìm thấy sản phẩm nào...Nhấp vào tất cả để xóa bộ lọc." />
    );
  }

  return (
    <div>
      <div>
        <Banner />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 m-8">
        {productsFiltered.map((product) => {
          return (
            <Fragment key={product.id}>
              <ProductCard data={product} />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
