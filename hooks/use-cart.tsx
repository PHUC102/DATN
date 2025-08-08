import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import { CartProductType } from "@/app/product/components/product-details";

type CartContextType = {
  cartTotalQuantity: number;
  cartTotalAmount: number;
  cartProducts: CartProductType[] | null;
  handleAddProductToCart: (product: CartProductType) => void;
  handleRemoveProductFromCart: (product: CartProductType) => void;
  clearWholeCart: () => void;
  handleCartQuantityIncrease: (product: CartProductType) => void;
  handleCartQuantityDecrease: (product: CartProductType) => void;
  paymentIntent: string | null;
  handleSetPaymentIntent: (value: string | null) => void;
};

export const CartContext = createContext<CartContextType | null>(null);

interface Props {
  [propName: string]: any;
}

export const CartContextProvider = (props: Props) => {
  const [cartTotalQuantity, setCartTotalQuantity] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [removingFromCart, setRemovingFromCart] = useState(false);
  const [cartProducts, setCartProducts] = useState<CartProductType[] | null>(
    null
  );
  const [cartTotalAmount, setCartTotalAmount] = useState(0);
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);

  useEffect(() => {
    const cartItems: any = localStorage.getItem("storeItems");
    const cartProductStorage: CartProductType[] | null = JSON.parse(cartItems);

    if (addingToCart) {
      toast.success("Mặt hàng đã được thêm vào giỏ hàng!");
      setAddingToCart(false);
    }
    if (removingFromCart) {
      toast.success("Mặt hàng đã bị xóa khỏi giỏ hàng!");
      setRemovingFromCart(false);
    }

    const storePaymentIntent: any = localStorage.getItem("storePaymentIntent");
    const paymentIntent: string | null = JSON.parse(storePaymentIntent);

    setCartProducts(cartProductStorage);
    setPaymentIntent(paymentIntent);
  }, [addingToCart, removingFromCart]);

  useEffect(() => {
    const getTotal = () => {
      if (cartProducts) {
        const { total, quantity } = cartProducts?.reduce(
          (acc, item) => {
            const itemTotal = item.price * item.quantity;
            acc.total += itemTotal;
            acc.quantity + item.quantity;

            return acc;
          },
          { total: 0, quantity: 0 }
        );

        setCartTotalQuantity(quantity);
        setCartTotalAmount(total);
      }
    };

    getTotal();
  }, [cartProducts]);

  useEffect(() => {
    const getTotal = () => {
      if (cartProducts) {
        const { total, quantity } = cartProducts?.reduce(
          (acc, item) => {
            const itemTotal = item.price * item.quantity;
            acc.total += itemTotal;
            acc.quantity += item.quantity;

            return acc;
          },
          { total: 0, quantity: 0 }
        );

        setCartTotalQuantity(quantity);
        setCartTotalAmount(total);
      }
    };

    getTotal();
  }, [cartProducts]);

  const handleAddProductToCart = useCallback((product: CartProductType) => {
    setCartProducts((prev) => {
      let updatedCart;
      if (prev) {
        updatedCart = [...prev, product];
      } else {
        updatedCart = [product];
      }

      setAddingToCart(true);
      localStorage.setItem("storeItems", JSON.stringify(updatedCart));
      return updatedCart;
    });
  }, []);

  const handleRemoveProductFromCart = useCallback(
    (product: CartProductType) => {
      if (cartProducts) {
        const filteredProducts = cartProducts.filter((item) => {
          return !(
            item.id === product.id &&
            item.selectedImage.color === product.selectedImage.color &&
            item.selectedSize === product.selectedSize
          );
        });
        setCartProducts(filteredProducts);
        setRemovingFromCart(true);
        localStorage.setItem("storeItems", JSON.stringify(filteredProducts));
      }
    },
    [cartProducts]
  );

  const clearWholeCart = useCallback(() => {
    setCartProducts([]);
    localStorage.setItem("storeItems", JSON.stringify([]));
  }, []);

  const handleCartQuantityIncrease = useCallback(
    (product: CartProductType) => {
      let updatedCart;

      if (product.quantity === 99) {
        return toast.error("Đã đạt số lượng tối đa!");
      }

      if (cartProducts) {
        updatedCart = [...cartProducts];
        const existingIndex = cartProducts.findIndex(
          (item) =>
            item.id === product.id &&
            item.selectedImage.color === product.selectedImage.color &&
            item.selectedSize === product.selectedSize
        );

        if (existingIndex > -1) {
          updatedCart[existingIndex].quantity = ++updatedCart[existingIndex]
            .quantity;
        }

        setCartProducts(updatedCart);
        localStorage.setItem("storeItems", JSON.stringify(updatedCart));
      }
    },
    [cartProducts]
  );

  const handleCartQuantityDecrease = useCallback(
    (product: CartProductType) => {
      let updatedCart;

      if (product.quantity === 1) {
        return toast.error("Đã đạt số lượng tối thiểu!");
      }

      if (cartProducts) {
        updatedCart = [...cartProducts];
        const existingIndex = cartProducts.findIndex(
          (item) =>
            item.id === product.id &&
            item.selectedImage.color === product.selectedImage.color &&
            item.selectedSize === product.selectedSize
        );

        if (existingIndex > -1) {
          updatedCart[existingIndex].quantity = --updatedCart[existingIndex]
            .quantity;
        }

        setCartProducts(updatedCart);
        localStorage.setItem("storeItems", JSON.stringify(updatedCart));
      }
    },
    [cartProducts]
  );

  const handleSetPaymentIntent = useCallback((value: string | null) => {
    setPaymentIntent(value);
    localStorage.setItem("storePaymentIntent", JSON.stringify(value));
  }, []);

  const value = {
    cartTotalQuantity,
    cartProducts,
    cartTotalAmount,
    handleAddProductToCart,
    handleRemoveProductFromCart,
    clearWholeCart,
    handleCartQuantityIncrease,
    handleCartQuantityDecrease,
    paymentIntent,
    handleSetPaymentIntent,
  };

  return <CartContext.Provider value={value} {...props} />;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (context === null) {
    throw new Error("Use Cart phải được sử dụng trong một Cart Context Provider");
  }

  return context;
};
