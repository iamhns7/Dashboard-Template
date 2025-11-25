import { useEffect, useRef, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/ProductsApi";
import { updateCart } from "../api/CartsApi";
import type { Product } from "../interfaces/ProductInterfaces";
import { useCart } from "../utils/hooks/useCart";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const Products = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
  // Fetch products - prioritize localStorage to preserve local changes
  const fetchProductsWithFallback = async () => {
    // Show loading for at least 500ms
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Always check localStorage first
    const stored = localStorage.getItem('products');
    
    // If localStorage has data, use it (preserves local edits)
    if (stored) {
      try {
        const localProducts = JSON.parse(stored);
        if (localProducts && localProducts.length > 0) {
          return localProducts;
        }
      } catch {
        // If parse fails, continue to API
      }
    }
    
    // Only fetch from API if localStorage is empty (first time)
    try {
      const apiProducts = await getProducts();
      if (apiProducts && apiProducts.length > 0) {
        localStorage.setItem('products', JSON.stringify(apiProducts));
        return apiProducts;
      }
      return [];
    } catch {
      return [];
    }
  };
  
  const { data: products = [], isLoading: loading } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: fetchProductsWithFallback,
    staleTime: Infinity, // Never refetch automatically, localStorage is source of truth
  });

  const [newProduct, setNewProduct] = useState<Product>({ title: "", price: 0, image: "" });
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'danger', text: string } | null>(null);
  const [loadingCartId, setLoadingCartId] = useState<number | null>(null);
  const addFileRef = useRef<HTMLInputElement | null>(null);
  const editFileRef = useRef<HTMLInputElement | null>(null);
  
  const { addToCart } = useCart();

  // Auto-hide alert after 3 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // ✅ Add new product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title.trim() || newProduct.price <= 0) {
      setAlertMessage({ type: 'danger', text: `❌ ${t('products.alerts.validationError')}` });
      return;
    }

    try {
      const payload: Partial<Product> = {
        title: newProduct.title.trim(),
        price: parseFloat(newProduct.price.toString()),
        image: newProduct.image && newProduct.image.trim() ? newProduct.image.trim() : "https://via.placeholder.com/200?text=Product+Image",
      };

      // Send to server
      const createdProduct = await createProduct(payload as Product);
      
      // Update cache AND localStorage
      const oldData = (queryClient.getQueryData(['products']) as Product[]) || [];
      const newData = [...oldData, createdProduct];
      
      queryClient.setQueryData(['products'], newData);
      localStorage.setItem('products', JSON.stringify(newData));

      setNewProduct({ title: "", price: 0, image: "" });
      setShowAddModal(false);
      setAlertMessage({ type: 'success', text: `✅ ${t('products.alerts.addSuccess')}` });
    } catch (error) {
      console.error("Product add error:", error);
      setAlertMessage({ type: 'danger', text: `❌ ${t('products.alerts.addError')}` });
    }
  };

  // ✅ Delete product
  const handleDelete = async (id: number) => {
    if (!confirm(t('products.deleteConfirm'))) return;
    try {
      await deleteProduct(id);

      // Update cache AND localStorage
      const oldData = (queryClient.getQueryData(['products']) as Product[]) || [];
      const newData = oldData.filter(p => p.id !== id);
      
      queryClient.setQueryData(['products'], newData);
      localStorage.setItem('products', JSON.stringify(newData));

      setAlertMessage({ type: 'success', text: `✅ ${t('products.alerts.deleteSuccess')}` });
    } catch (error) {
      console.error("Product delete error:", error);
      setAlertMessage({ type: 'danger', text: `❌ ${t('products.alerts.deleteError')}` });
    }
  };

  // 🛒 Add product to cart
  const handleAddToCart = async (product: Product) => {
    if (!product.id) return;
    
    try {
      setLoadingCartId(product.id);
      
      // Call API to update cart with product
      await updateCart(1, {
        id: 1,
        userId: 1,
        date: new Date().toISOString(),
        products: [{ productId: product.id, quantity: 1 }],
      });
      
      // Update local context after API response
      addToCart(product.id, 1);
      setAlertMessage({ type: 'success', text: `✅ ${product.title} ${t('products.alerts.cartSuccess')}` });
    } catch (error) {
      console.error("Add to cart error:", error);
      setAlertMessage({ type: 'danger', text: `❌ ${t('products.alerts.cartError')}` });
    } finally {
      setLoadingCartId(null);
    }
  };

  // ✅ Update product
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct?.id) return;
    if (!editProduct.title.trim() || editProduct.price <= 0) {
      setAlertMessage({ type: 'danger', text: `❌ ${t('products.alerts.validationError')}` });
      return;
    }

    try {
      const payload: Partial<Product> = {
        title: editProduct.title.trim(),
        price: parseFloat(editProduct.price.toString()),
        image: editProduct.image && editProduct.image.trim() ? editProduct.image.trim() : "https://via.placeholder.com/200?text=Product+Image",
      };

      // API'ye gönder
      await updateProduct(editProduct.id, payload as Product);
      
      // editProduct'ı local state'ten direkt kullan (API mock döndürebilir)
      const finalProduct: Product = {
        ...editProduct,
        title: payload.title!,
        price: payload.price!,
        image: payload.image!,
      };
      
      // Update cache AND localStorage with actual edited values
      const oldData = (queryClient.getQueryData(['products']) as Product[]) || [];
      const newData = oldData.map(p => p.id === editProduct.id ? finalProduct : p);
      
      queryClient.setQueryData(['products'], newData);
      localStorage.setItem('products', JSON.stringify(newData));

      setEditProduct(null);
      setAlertMessage({ type: 'success', text: `✅ ${t('products.alerts.updateSuccess')}` });
    } catch (error) {
      console.error("Product update error:", error);
      setAlertMessage({ type: 'danger', text: `❌ ${t('products.alerts.updateError')}` });
    }
  };

  if (loading)
    return (
      <div className="container mt-4">
        <h2 className="mb-4">{t('products.title')}</h2>
        <div className="row">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="col-md-3 mb-4">
              <div className="card h-100 text-center p-2">
                <div
                  className="bg-secondary rounded opacity-25"
                  style={{ height: 200 }}
                ></div>
                <div className="card-body">
                  <div className="bg-secondary rounded mb-2 mx-auto opacity-25" style={{ height: 18, width: '60%' }}></div>
                  <div className="bg-secondary rounded mb-3 mx-auto opacity-25" style={{ height: 14, width: '30%' }}></div>
                  <div className="d-flex justify-content-center gap-2">
                    <div className="bg-secondary rounded opacity-25" style={{ width: 60, height: 30 }}></div>
                    <div className="bg-secondary rounded opacity-25" style={{ width: 60, height: 30 }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">{t('products.title')}</h2>
        <button 
          className="btn btn-outline-primary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="ri-add-line me-2"></i>
          {t('products.addButton')}
        </button>
      </div>

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

      {/* 📋 Products List */}
      <div className="row">
        {products.map((product) => (
          <div key={product.id} className="col-md-3 mb-4">
            <div className="card h-100 text-center p-2 d-flex flex-column">
              <img
                src={product.image || "https://via.placeholder.com/200?text=Product+Image"}
                alt={product.title}
                className="card-img-top object-fit-contain"
                style={{ height: "200px" }}
              />
              <div className="card-body d-flex flex-column flex-grow-1">
                <h5 className="card-title text-truncate" style={{ 
                  minHeight: '3rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {product.title}
                </h5>
                <p className="card-text mb-3">
                  <strong className="text-success">${product.price}</strong>
                </p>
                
                {/* Spacer to push buttons to bottom */}
                <div className="mt-auto">
                  <div className="d-flex flex-column gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary w-100"
                      onClick={() => handleAddToCart(product)}
                      disabled={loadingCartId === product.id}
                    >
                      {loadingCartId === product.id ? (
                        <>
                          <span 
                            className="spinner-border spinner-border-sm me-2" 
                            role="status" 
                            aria-hidden="true"
                          ></span>
                          {t('products.adding')}
                        </>
                      ) : (
                        <>
                          <i className="ri-shopping-cart-line me-1"></i>
                          {t('products.addToCart')}
                        </>
                      )}
                    </button>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary flex-fill"
                        onClick={() => setEditProduct(product)}
                      >
                        <i className="ri-edit-line me-1"></i>
                        {t('products.edit')}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary flex-fill"
                        onClick={() => handleDelete(product.id!)}
                      >
                        <i className="ri-delete-bin-line me-1"></i>
                        {t('products.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ➕ Add Product Modal */}
      {showAddModal && (
        <div className="modal show d-block bg-dark bg-opacity-50 min-vh-100" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleAddProduct}>
                <div className="modal-header">
                  <h5 className="modal-title">{t('products.addModal.title')}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewProduct({ title: "", price: 0, image: "" });
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="productTitle" className="form-label">{t('products.addModal.productTitle')}</label>
                    <input
                      id="productTitle"
                      type="text"
                      className="form-control"
                      placeholder={t('products.addModal.enterTitle')}
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productPrice" className="form-label">{t('products.addModal.price')}</label>
                    <input
                      id="productPrice"
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder={t('products.addModal.enterPrice')}
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: parseFloat(e.target.value || '0') })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t('products.addModal.image')}</label>
                    <div className="d-flex gap-2 align-items-center">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => addFileRef.current?.click()}
                      >
                        <i className="ri-upload-cloud-line me-2"></i>
                        {t('products.addModal.uploadImage')}
                      </button>
                      <input
                        ref={addFileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (!file) return;
                          
                          // Compress image before converting to base64
                          const img = new Image();
                          const canvas = document.createElement('canvas');
                          const reader = new FileReader();
                          
                          reader.onload = (event) => {
                            img.onload = () => {
                              // Resize to max 800x600
                              const maxWidth = 800;
                              const maxHeight = 600;
                              let width = img.width;
                              let height = img.height;
                              
                              if (width > height) {
                                if (width > maxWidth) {
                                  height = (height * maxWidth) / width;
                                  width = maxWidth;
                                }
                              } else {
                                if (height > maxHeight) {
                                  width = (width * maxHeight) / height;
                                  height = maxHeight;
                                }
                              }
                              
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(img, 0, 0, width, height);
                              
                              // Convert to base64 with compression
                              const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
                              setNewProduct({ ...newProduct, image: compressedImage });
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      {newProduct.image && (
                        <span className="text-success">
                          <i className="ri-check-circle-line me-1"></i>
                          {t('products.addModal.imageSelected')}
                        </span>
                      )}
                    </div>
                    {newProduct.image && (
                      <div className="mt-2">
                        <small className="text-muted">{t('products.addModal.preview')}:</small>
                        <img 
                          src={newProduct.image} 
                          alt="Preview" 
                          className="border rounded w-100 object-fit-contain mt-2"
                          style={{ maxHeight: '150px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={!newProduct.title.trim() || newProduct.price <= 0}
                  >
                    <i className="ri-check-line me-1"></i>
                    {t('products.addModal.addProduct')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewProduct({ title: "", price: 0, image: "" });
                    }}
                  >
                    {t('products.addModal.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ Edit Product Modal */}
      {editProduct && (
        <div className="modal show d-block bg-dark bg-opacity-50 min-vh-100" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleUpdateProduct}>
                <div className="modal-header">
                  <h5 className="modal-title">{t('products.editModal.title')}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditProduct(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editTitle" className="form-label">{t('products.addModal.productTitle')}</label>
                    <input
                      id="editTitle"
                      type="text"
                      className="form-control"
                      value={editProduct.title}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editPrice" className="form-label">{t('products.addModal.price')}</label>
                    <input
                      id="editPrice"
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={editProduct.price}
                      onChange={(e) =>
                        setEditProduct({
                          ...editProduct,
                          price: parseFloat(e.target.value || '0'),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t('products.addModal.image')}</label>
                    <div className="d-flex gap-2 align-items-center">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => editFileRef.current?.click()}
                      >
                        <i className="ri-upload-cloud-line me-2"></i>
                        {t('products.addModal.uploadImage')}
                      </button>
                      <input
                        ref={editFileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (!file) return;
                          
                          // Compress image before converting to base64
                          const img = new Image();
                          const canvas = document.createElement('canvas');
                          const reader = new FileReader();
                          
                          reader.onload = (event) => {
                            img.onload = () => {
                              // Resize to max 800x600
                              const maxWidth = 800;
                              const maxHeight = 600;
                              let width = img.width;
                              let height = img.height;
                              
                              if (width > height) {
                                if (width > maxWidth) {
                                  height = (height * maxWidth) / width;
                                  width = maxWidth;
                                }
                              } else {
                                if (height > maxHeight) {
                                  width = (width * maxHeight) / height;
                                  height = maxHeight;
                                }
                              }
                              
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(img, 0, 0, width, height);
                              
                              // Convert to base64 with compression
                              const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
                              setEditProduct({ ...editProduct, image: compressedImage });
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      {editProduct.image && (
                        <span className="text-success">
                          <i className="ri-check-circle-line me-1"></i>
                          {t('products.addModal.imageSelected')}
                        </span>
                      )}
                    </div>
                    {editProduct.image && (
                      <div className="mt-2">
                        <small className="text-muted">{t('products.addModal.preview')}:</small>
                        <img 
                          src={editProduct.image} 
                          alt="Preview" 
                          className="border rounded w-100 object-fit-contain mt-2"
                          style={{ maxHeight: '150px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={!editProduct.title.trim() || editProduct.price <= 0}
                  >
                    {t('products.editModal.saveChanges')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditProduct(null)}
                  >
                    {t('products.editModal.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
