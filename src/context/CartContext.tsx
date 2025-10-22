import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Cart } from "../interfaces/CartInterfaces";

interface CartContextType {
  cart: Cart | null;
  addToCart: (productId: number, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
}

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("userCart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      // Initialize empty cart
      const newCart: Cart = {
        id: 1,
        userId: 1,
        date: new Date().toISOString(),
        products: [],
      };
      setCart(newCart);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart) {
      localStorage.setItem("userCart", JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (productId: number, quantity: number = 1) => {
    if (!cart) return;

    const existingProduct = cart.products.find((p) => p.productId === productId);

    if (existingProduct) {
      // Update quantity if product already exists
      setCart({
        ...cart,
        products: cart.products.map((p) =>
          p.productId === productId
            ? { ...p, quantity: p.quantity + quantity }
            : p
        ),
      });
    } else {
      // Add new product
      setCart({
        ...cart,
        products: [...cart.products, { productId, quantity }],
      });
    }
  };

  const removeFromCart = (productId: number) => {
    if (!cart) return;

    setCart({
      ...cart,
      products: cart.products.filter((p) => p.productId !== productId),
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (!cart) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart({
      ...cart,
      products: cart.products.map((p) =>
        p.productId === productId ? { ...p, quantity } : p
      ),
    });
  };

  const clearCart = () => {
    if (!cart) return;

    setCart({
      ...cart,
      products: [],
    });
  };

  const getCartItemCount = (): number => {
    if (!cart) return 0;
    return cart.products.reduce((total, product) => total + product.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
