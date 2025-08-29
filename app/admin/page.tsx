// app/admin/page.tsx
import { Container } from "@/components/ui/container";
import getProducts from "@/actions/get-products";
import getOrders from "@/actions/get-orders";
import getUsers from "@/actions/get-users";
import getGraphData from "@/actions/get-graph-data";
import Summary from "./components/summary";
import BarGraph from "./components/bar-graph";

export default async function AdminPage() {
  const [products, orders, users, graphData] = await Promise.all([
    getProducts({ category: null }),
    getOrders(),
    getUsers(),
    getGraphData(),
  ]);

  return (
    <div className="pt-8">
      <Container>
        <Summary
          orders={orders}
          productsCount={products?.length ?? 0}
          usersCount={users?.length ?? 0}
        />
        <div className="mt-6 mx-auto w-full md:max-w-[75vw]">
          <BarGraph data={graphData} />
        </div>
      </Container>
    </div>
  );
}
