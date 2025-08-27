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
import { FormWrap } from "@/components/ui/form-wrap";
import { CheckoutClient } from "./components/client";
import PayWithVnpayButton from "./components/pay-with-vnpay-button";

export default function CheckoutPage() {
  return (
    <div className="p-8">
      <Container>
        <FormWrap>
          {/* Stripe giữ nguyên */}
          <CheckoutClient />

          {/* VNPAY tách rời, đặt dưới form Stripe */}
          <div className="mt-4">
            <PayWithVnpayButton />
          </div>
        </FormWrap>
      </Container>
    </div>
  );
}
