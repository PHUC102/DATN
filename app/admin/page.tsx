import { Container } from "@/components/ui/container";
import { Summary } from "./components/summary";
import getProducts from "@/actions/get-products";
import getOrders from "@/actions/get-orders";
import getUsers from "@/actions/get-users";
import { BarGraph } from "./components/bar-graph";
import getGraphData from "@/actions/get-graph-data";

export default async function AdminPage() {
  const products = await getProducts({ category: null });
  const orders = await getOrders();
  const users = await getUsers();
  const graphData = await getGraphData();

  return (
    <div className="pt-8">
      <Container>
        <Summary products={products} orders={orders} users={users} />
        <div className="mt-4 md:mt-6 mx-auto w-full md:max-w-[75vw]">
          <BarGraph data={graphData} />
        </div>
      </Container>
    </div>
  );
}
