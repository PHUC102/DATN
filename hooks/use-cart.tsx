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
  const [cartProducts, setCartProducts] = useState<CartProductType[] | null>(null);
  const [cartTotalAmount, setCartTotalAmount] = useState(0);
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);

  // Load dữ liệu từ localStorage
  useEffect(() => {
    const cartItems = localStorage.getItem("storeItems");
    const cartProductStorage: CartProductType[] | null = cartItems ? JSON.parse(cartItems) : null;

    if (addingToCart) {
      toast.success("Mặt hàng đã được thêm vào giỏ hàng!");
      setAddingToCart(false);
    }
    if (removingFromCart) {
      toast.success("Mặt hàng đã bị xóa khỏi giỏ hàng!");
      setRemovingFromCart(false);
    }

    const storePaymentIntent = localStorage.getItem("storePaymentIntent");
    const paymentIntent: string | null = storePaymentIntent ? JSON.parse(storePaymentIntent) : null;

    setCartProducts(cartProductStorage);
    setPaymentIntent(paymentIntent);
  }, [addingToCart, removingFromCart]);

  // ❌ SAI: em đang có 2 useEffect tính tổng, 1 cái viết sai
  // useEffect(() => {
  //   if (cartProducts) {
  //     const { total, quantity } = cartProducts.reduce((acc, item) => {
  //       const itemTotal = item.price * item.quantity;
  //       acc.total += itemTotal;
  //       acc.quantity + item.quantity; // ❌ SAI: không gán, không có tác dụng
  //       return acc;
  //     }, { total: 0, quantity: 0 });
  //
  //     setCartTotalQuantity(quantity);
  //     setCartTotalAmount(total);
  //   }
  // }, [cartProducts]);

  // ✅ ĐÚNG: chỉ giữ lại 1 useEffect và viết chuẩn
  useEffect(() => {
    if (!cartProducts) {
      setCartTotalQuantity(0);
      setCartTotalAmount(0);
      return;
    }

    const { total, quantity } = cartProducts.reduce(
      (acc, item) => {
        acc.total += item.price * item.quantity;
        acc.quantity += item.quantity; // ✅ cộng đúng
        return acc;
      },
      { total: 0, quantity: 0 }
    );

    setCartTotalQuantity(quantity);
    setCartTotalAmount(total);
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

  // =======================
  // TĂNG SỐ LƯỢNG
  // =======================
  const handleCartQuantityIncrease = useCallback(
    (product: CartProductType) => {
      if (product.quantity === 99) {
        return toast.error("Đã đạt số lượng tối đa!");
      }

      if (cartProducts) {
        const updatedCart = [...cartProducts];
        const existingIndex = cartProducts.findIndex(
          (item) =>
            item.id === product.id &&
            item.selectedImage.color === product.selectedImage.color &&
            item.selectedSize === product.selectedSize
        );

        if (existingIndex > -1) {
          // ❌ SAI:
          // updatedCart[existingIndex].quantity = ++updatedCart[existingIndex].quantity;

          // ✅ ĐÚNG:
          const item = updatedCart[existingIndex];
          updatedCart[existingIndex] = { ...item, quantity: item.quantity + 1 };
        }

        setCartProducts(updatedCart);
        localStorage.setItem("storeItems", JSON.stringify(updatedCart));
      }
    },
    [cartProducts]
  );

  // =======================
  // GIẢM SỐ LƯỢNG
  // =======================
  const handleCartQuantityDecrease = useCallback(
    (product: CartProductType) => {
      if (product.quantity === 1) {
        return toast.error("Đã đạt số lượng tối thiểu!");
      }

      if (cartProducts) {
        const updatedCart = [...cartProducts];
        const existingIndex = cartProducts.findIndex(
          (item) =>
            item.id === product.id &&
            item.selectedImage.color === product.selectedImage.color &&
            item.selectedSize === product.selectedSize
        );

        if (existingIndex > -1) {
          // ❌ SAI:
          // updatedCart[existingIndex].quantity = --updatedCart[existingIndex].quantity;

          // ✅ ĐÚNG:
          const item = updatedCart[existingIndex];
          updatedCart[existingIndex] = {
            ...item,
            quantity: Math.max(1, item.quantity - 1),
          };
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
