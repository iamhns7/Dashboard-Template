import { useEffect, useState } from "react";
import { getAllCarts } from "../api/CartsApi";
import type { Cart } from "../interfaces/CartInterfaces";

const Carts = () => {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCarts()
      .then((data) => {
        setCarts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching carts:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading carts...</p>;

  return (
    <div className="container mt-4">
      <h2>Carts</h2>
      {carts.map((cart) => (
        <div key={cart.id} className="card p-3 mb-3 shadow-sm">
          <h5>Cart #{cart.id}</h5>
          <p><strong>User ID:</strong> {cart.userId}</p>
          <p><strong>Date:</strong> {cart.date}</p>
          <ul>
            {cart.products.map((p) => (
              <li key={p.productId}>
                🛒 Product ID: {p.productId} — Quantity: {p.quantity}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Carts;
