//import { Container } from "@/components/ui/container";
//import { FormWrap } from "@/components/ui/form-wrap";
//import { CheckoutClient } from "./components/client";

//export default function CheckoutPage() {
  //return (
    //<div className="p-8">
      //<Container>
        //<FormWrap>
          //<CheckoutClient />
        //</FormWrap>
      //</Container>
    //</div>
  //);
//}
import { Container } from "@/components/ui/container";
import { CheckoutClient } from "./components/client";

export default function CheckoutPage() {
  return (
    <Container>
      <CheckoutClient />
    </Container>
  );
}

