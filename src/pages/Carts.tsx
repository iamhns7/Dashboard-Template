import { useEffect, useState } from "react";
import { getAllCarts, updateCart, deleteCart } from "../api/CartsApi";
import type { Cart } from "../interfaces/CartInterfaces";

const Carts = () => {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCarts();
  }, []);

  const loadCarts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCarts();
      setCarts(data ?? []);
    } catch (err) {
      console.error("Error fetching carts:", err);
      setError("Server error: failed to load carts.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeQuantity = async (
    cartId: number,
    productId: number,
    delta: number
  ) => {
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return;

    const prod = cart.products.find((p) => p.productId === productId);
    if (!prod) return;

    const newQuantity = Math.max(0, prod.quantity + delta);

    // optimistic update
    const updatedCarts = carts.map((c) =>
      c.id === cartId
        ? {
            ...c,
            products: c.products.map((p) =>
              p.productId === productId ? { ...p, quantity: newQuantity } : p
            ),
          }
        : c
    );
    setCarts(updatedCarts);

    try {
      await updateCart(cartId, { products: updatedCarts.find(c => c.id === cartId)!.products });
    } catch (err) {
      console.error("Error updating cart:", err);
      setError("An error occurred during the update.");
      // revert
      setCarts(carts);
    }
  };

  const handleRemoveProduct = async (cartId: number, productId: number) => {
    if (!confirm("Are you sure you want to remove this product from your cart?")) return;
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return;

    const updatedProducts = cart.products.filter((p) => p.productId !== productId);
    const updatedCarts = carts.map((c) => (c.id === cartId ? { ...c, products: updatedProducts } : c));
    setCarts(updatedCarts);

    try {
      await updateCart(cartId, { products: updatedProducts });
    } catch (err) {
      console.error("Error removing product from cart:", err);
      setError("An error occurred while removing the product.");
      setCarts(carts);
    }
  };

  const handleDeleteCart = async (cartId: number) => {
    if (!confirm("Are you sure you want to delete this cart?")) return;
    const remaining = carts.filter((c) => c.id !== cartId);
    setCarts(remaining);

    try {
      await deleteCart(cartId);
    } catch (err) {
      console.error("Error deleting cart:", err);
      setError("An error occurred while deleting the cart..");
      setCarts(carts);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h2>Carts</h2>
        <div className="row">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="col-md-6" key={i}>
              <div className="card p-3 mb-3 shadow-sm">
                <div className="placeholder-glow">
                  <span className="placeholder col-6"></span>
                  <p className="placeholder col-4 mt-2"></p>
                  <div className="d-flex gap-2 mt-3">
                    <span className="placeholder col-3"></span>
                    <span className="placeholder col-3"></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Carts</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {carts.length === 0 ? (
        <div className="card p-4 text-center">
          <h5>No carts yet.</h5>
          <p className="text-muted">Carts that contain products will appear here.</p>
        </div>
      ) : (
        <div className="row">
          {carts.map((cart) => (
            <div key={cart.id} className="col-md-6 mb-4">
              <div className="card p-3 h-100 shadow-sm">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                    <h5 className="mb-1">Cart #{cart.id}</h5>
                    <small className="text-muted">User: {cart.userId} • {new Date(cart.date).toLocaleDateString()}</small>
                  </div>
                    <div>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteCart(cart.id)}>Delete Cart</button>
                  </div>
                </div>

                <hr />

                {cart.products.length === 0 ? (
                  <p className="text-muted">This cart is empty.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {cart.products.map((p) => (
                      <li key={p.productId} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <div><strong>Product ID:</strong> {p.productId}</div>
                          <div className="text-muted">Quantity: {p.quantity}</div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <div className="input-group" style={{ width: 140 }}>
                            <button className="btn btn-outline-secondary" type="button" onClick={() => handleChangeQuantity(cart.id, p.productId, -1)}>-</button>
                            <input type="text" className="form-control text-center" value={p.quantity} readOnly />
                            <button className="btn btn-outline-secondary" type="button" onClick={() => handleChangeQuantity(cart.id, p.productId, 1)}>+</button>
                          </div>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveProduct(cart.id, p.productId)}>Remove</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">Total Items: {cart.products.reduce((s, x) => s + x.quantity, 0)}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Carts;
