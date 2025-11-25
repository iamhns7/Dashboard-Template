import { useEffect, useState } from "react";
import { getAllCarts, updateCart, deleteCart } from "../api/CartsApi";
import { getProducts } from "../api/ProductsApi";
import type { Cart } from "../interfaces/CartInterfaces";
import type { Product } from "../interfaces/ProductInterfaces";
import { useCart } from "../utils/hooks/useCart";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const Carts = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { data: products = [] } = useQuery<Product[], Error>({ queryKey: ['products'], queryFn: getProducts });
  const { data: carts = [], isLoading: loading, error } = useQuery<Cart[], Error>({ queryKey: ['carts'], queryFn: getAllCarts});
  const [showMyCart, setShowMyCart] = useState(true);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'danger', text: string } | null>(null);
  
  const { cart: myCart, updateQuantity, removeFromCart, clearCart } = useCart();

  // Auto-hide alert after 3 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // react-query provides carts & products; no manual load needed

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

    // optimistic update via react-query cache
    const previous = queryClient.getQueryData<Cart[]>(['carts']);
    const updatedCarts = (previous ?? carts).map((c) =>
      c.id === cartId
        ? {
            ...c,
            products: c.products.map((p) =>
              p.productId === productId ? { ...p, quantity: newQuantity } : p
            ),
          }
        : c
    );
    queryClient.setQueryData(['carts'], updatedCarts);

    try {
      await updateCart(cartId, { products: updatedCarts.find((c) => c.id === cartId)!.products });
      await queryClient.invalidateQueries({ queryKey: ['carts'] });
    } catch (err) {
      console.error("Error updating cart:", err);
      setAlertMessage({ type: 'danger', text: `❌ ${t('carts.alerts.removeError')}` });
      // revert
      queryClient.setQueryData(['carts'], previous);
    }
  };

  // My Cart handlers with notifications
  const handleRemoveFromMyCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    removeFromCart(productId);
    setAlertMessage({ 
      type: 'success', 
      text: `✅ ${t('carts.alerts.removeSuccess')}` 
    });
  };

  const handleClearMyCart = () => {
    if (confirm(t('carts.removeConfirm'))) {
      clearCart();
      setAlertMessage({ 
        type: 'success', 
        text: `✅ ${t('carts.alerts.removeSuccess')}` 
      });
    }
  };

  const handleUpdateMyCartQuantity = (productId: number, quantity: number) => {
    updateQuantity(productId, quantity);
    if (quantity === 0) {
      setAlertMessage({ 
        type: 'success', 
        text: `✅ ${t('carts.alerts.removeSuccess')}` 
      });
    }
  };

  const handleRemoveProduct = async (cartId: number, productId: number) => {
    if (!confirm(t('carts.removeConfirm'))) return;
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return;

    const updatedProducts = cart.products.filter((p) => p.productId !== productId);
    const previous = queryClient.getQueryData<Cart[]>(['carts']);
    const updatedCarts = (previous ?? carts).map((c) => (c.id === cartId ? { ...c, products: updatedProducts } : c));
    queryClient.setQueryData(['carts'], updatedCarts);

    try {
      await updateCart(cartId, { products: updatedProducts });
      await queryClient.invalidateQueries({ queryKey: ['carts'] });
    } catch (err) {
      console.error("Error removing product from cart:", err);
      setAlertMessage({ type: 'danger', text: `❌ ${t('carts.alerts.removeError')}` });
      queryClient.setQueryData(['carts'], previous);
    }
  };

  const handleDeleteCart = async (cartId: number) => {
    if (!confirm(t('carts.removeConfirm'))) return;
    const previous = queryClient.getQueryData<Cart[]>(['carts']);
    const remaining = (previous ?? carts).filter((c) => c.id !== cartId);
    queryClient.setQueryData(['carts'], remaining);

    try {
      await deleteCart(cartId);
      await queryClient.invalidateQueries({ queryKey: ['carts'] });
      setAlertMessage({ type: 'success', text: `✅ ${t('carts.alerts.removeSuccess')}` });
    } catch (err) {
      console.error("Error deleting cart:", err);
      setAlertMessage({ type: 'danger', text: `❌ ${t('carts.alerts.removeError')}` });
      queryClient.setQueryData(['carts'], previous);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h2>{t('carts.title')}</h2>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">{t('carts.title')}</h2>
        <div className="btn-group" role="group">
          <button 
            className={`btn btn-sm ${showMyCart ? 'btn-outline-primary active' : 'btn-outline-primary'}`}
            onClick={() => setShowMyCart(true)}
          >
            <i className="ri-shopping-cart-2-line me-1"></i>
            {t('carts.myCart')}
          </button>
          <button 
            className={`btn btn-sm ${!showMyCart ? 'btn-outline-primary active' : 'btn-outline-primary'}`}
            onClick={() => setShowMyCart(false)}
          >
            <i className="ri-list-check me-1"></i>
            {t('carts.allCarts')}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {/* Alert Message */}
      {alertMessage && (
        <div 
          className={`alert alert-${alertMessage.type} alert-dismissible fade show position-fixed top-0 end-0 m-3 shadow`} 
          role="alert"
          style={{ zIndex: 9999, minWidth: '300px' }}
        >
          {alertMessage.text}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setAlertMessage(null)}
          ></button>
        </div>
      )}

      {showMyCart ? (
        // My Cart View
        <div className="card shadow-sm">
          <div className="card-body">
            <h4 className="card-title mb-4">
              <i className="ri-shopping-cart-2-line me-2"></i>
              {t('carts.title')}
            </h4>
            {!myCart || myCart.products.length === 0 ? (
              <div className="text-center py-5">
                <i className="ri-shopping-cart-line text-muted" style={{ fontSize: '4rem' }}></i>
                <h5 className="mt-3">{t('carts.emptyCart')}</h5>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Image</th>
                        <th>{t('carts.price')}</th>
                        <th>{t('carts.quantity')}</th>
                        <th>{t('carts.total')}</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myCart.products.map((item) => {
                        const product = products.find((p) => p.id === item.productId);
                        return (
                          <tr key={item.productId}>
                            <td>
                              <strong>{product?.title || `Product #${item.productId}`}</strong>
                            </td>
                            <td>
                              {product?.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.title}
                                  className="object-fit-contain"
                                  style={{ width: '50px', height: '50px' }}
                                />
                              ) : (
                                <div 
                                  className="bg-light d-flex align-items-center justify-content-center"
                                  style={{ width: '50px', height: '50px' }}
                                >
                                  <i className="ri-image-line text-muted"></i>
                                </div>
                              )}
                            </td>
                            <td>${product?.price?.toFixed(2) || '0.00'}</td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-secondary"
                                  onClick={() => handleUpdateMyCartQuantity(item.productId, item.quantity - 1)}
                                >
                                  <i className="ri-subtract-line"></i>
                                </button>
                                <span className="btn btn-outline-secondary disabled">
                                  {item.quantity}
                                </span>
                                <button 
                                  className="btn btn-outline-secondary"
                                  onClick={() => handleUpdateMyCartQuantity(item.productId, item.quantity + 1)}
                                >
                                  <i className="ri-add-line"></i>
                                </button>
                              </div>
                            </td>
                            <td>
                              <strong>${((product?.price || 0) * item.quantity).toFixed(2)}</strong>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleRemoveFromMyCart(item.productId)}
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <h4>
                    {t('carts.cartTotal')}: ${myCart.products.reduce((total, item) => {
                      const product = products.find((p) => p.id === item.productId);
                      return total + (product?.price || 0) * item.quantity;
                    }, 0).toFixed(2)}
                  </h4>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={handleClearMyCart}
                    >
                      <i className="ri-delete-bin-line me-1"></i>
                      {t('carts.remove')}
                    </button>
                    <button className="btn btn-outline-primary">
                      <i className="ri-shopping-bag-line me-1"></i>
                      {t('carts.checkout')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        // All Carts View (existing code)
        <>
          {carts.length === 0 ? (
            <div className="card p-4 text-center">
              <h5>{t('carts.noCarts')}</h5>
              <p className="text-muted">{t('carts.cartsDescription')}</p>
            </div>
          ) : (
            <div className="row">
              {carts.map((cart) => (
                <div key={cart.id} className="col-md-6 mb-4">
                  <div className="card p-3 h-100 shadow-sm">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                        <h5 className="mb-1">{t('carts.cartNumber')}{cart.id}</h5>
                        <small className="text-muted">{t('carts.user')}: {cart.userId} • {new Date(cart.date).toLocaleDateString()}</small>
                      </div>
                        <div>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleDeleteCart(cart.id)}>
                          <i className="ri-delete-bin-line me-1"></i>
                          {t('carts.deleteCart')}
                        </button>
                      </div>
                    </div>

                    <hr />

                    {cart.products.length === 0 ? (
                      <p className="text-muted">{t('carts.cartEmpty')}</p>
                    ) : (
                      <ul className="list-group list-group-flush">
                        {cart.products.map((p) => (
                          <li key={p.productId} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <div><strong>{t('carts.productId')}:</strong> {p.productId}</div>
                              <div className="text-muted">{t('carts.quantity')}: {p.quantity}</div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <div className="input-group" style={{ width: 140 }}>
                                <button className="btn btn-outline-secondary" type="button" onClick={() => handleChangeQuantity(cart.id, p.productId, -1)}>-</button>
                                <input type="text" className="form-control text-center" value={p.quantity} readOnly />
                                <button className="btn btn-outline-secondary" type="button" onClick={() => handleChangeQuantity(cart.id, p.productId, 1)}>+</button>
                              </div>
                              <button className="btn btn-sm btn-outline-primary" onClick={() => handleRemoveProduct(cart.id, p.productId)}>
                                <i className="ri-delete-bin-line me-1"></i>
                                {t('carts.remove')}
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-3 d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">{t('carts.totalItems')}: {cart.products.reduce((s, x) => s + x.quantity, 0)}</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Carts;
