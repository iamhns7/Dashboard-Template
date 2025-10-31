import { useEffect, useRef, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/ProductsApi";
import { updateCart } from "../api/CartsApi";
import type { Product } from "../interfaces/ProductInterfaces";
import { useCart } from "../hooks/useCart";
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Products = () => {
  const queryClient = useQueryClient();
  
  // Fetch products from API, with localStorage fallback
  const fetchProductsWithFallback = async () => {
    try {
      const apiProducts = await getProducts();
      // If API returns data, save to localStorage and return
      if (apiProducts && apiProducts.length > 0) {
        localStorage.setItem('products', JSON.stringify(apiProducts));
        return apiProducts;
      }
      // If API returns empty, try localStorage
      const stored = localStorage.getItem('products');
      return stored ? JSON.parse(stored) : [];
    } catch {
      // If API fails, use localStorage
      const stored = localStorage.getItem('products');
      return stored ? JSON.parse(stored) : [];
    }
  };
  
  const { data: products = [], isLoading: loading } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: fetchProductsWithFallback,
    initialData: () => {
      const stored = localStorage.getItem('products');
      return stored ? JSON.parse(stored) : [];
    },
    staleTime: 1000 * 60 * 10, // keep fresh for 10 minutes
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

  // No manual fetch needed — react-query handles loading and caching.

  // ✅ Add new product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title.trim() || newProduct.price <= 0) {
      setAlertMessage({ type: 'danger', text: '❌ Please enter valid title and price!' });
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
      const oldData = queryClient.getQueryData(['products']) as Product[] | undefined;
      const newData = oldData ? [...oldData, createdProduct] : [createdProduct];
      
      queryClient.setQueryData(['products'], newData);
      localStorage.setItem('products', JSON.stringify(newData));

      setNewProduct({ title: "", price: 0, image: "" });
      setShowAddModal(false);
      setAlertMessage({ type: 'success', text: '✅ Product added successfully!' });
    } catch (error) {
      console.error("Product add error:", error);
      setAlertMessage({ type: 'danger', text: '❌ Product could not be added!' });
    }
  };

  // ✅ Delete product
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);

      // Update cache AND localStorage
      const oldData = queryClient.getQueryData(['products']) as Product[] | undefined;
      const newData = oldData ? oldData.filter(p => p.id !== id) : [];
      
      queryClient.setQueryData(['products'], newData);
      localStorage.setItem('products', JSON.stringify(newData));

      setAlertMessage({ type: 'success', text: '✅ Product deleted successfully!' });
    } catch (error) {
      console.error("Product delete error:", error);
      setAlertMessage({ type: 'danger', text: '❌ Product could not be deleted!' });
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
      setAlertMessage({ type: 'success', text: `✅ ${product.title} added to cart!` });
    } catch (error) {
      console.error("Add to cart error:", error);
      setAlertMessage({ type: 'danger', text: '❌ Failed to add to cart!' });
    } finally {
      setLoadingCartId(null);
    }
  };

  // ✅ Update product
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct?.id) return;
    if (!editProduct.title.trim() || editProduct.price <= 0) {
      setAlertMessage({ type: 'danger', text: '❌ Please enter valid title and price!' });
      return;
    }

    try {
      const payload: Partial<Product> = {
        title: editProduct.title.trim(),
        price: parseFloat(editProduct.price.toString()),
        image: editProduct.image && editProduct.image.trim() ? editProduct.image.trim() : "https://via.placeholder.com/200?text=Product+Image",
      };

      // API'ye gönder ve response'u al
      const updatedProduct = await updateProduct(editProduct.id, payload as Product);
      
      // Cache'i güncelleyin - mergesiz state ve response kullanın
      const finalProduct = {
        ...updatedProduct,
        image: updatedProduct.image || editProduct.image || payload.image,
      };
      
      // Update cache AND localStorage
      const oldData = queryClient.getQueryData(['products']) as Product[] | undefined;
      const newData = oldData 
        ? oldData.map(p => p.id === editProduct.id ? finalProduct : p)
        : [finalProduct];
      
      queryClient.setQueryData(['products'], newData);
      localStorage.setItem('products', JSON.stringify(newData));

      setEditProduct(null);
      setAlertMessage({ type: 'success', text: '✅ The product has been updated successfully!' });
    } catch (error) {
      console.error("Product update error:", error);
      setAlertMessage({ type: 'danger', text: '❌ Product could not be updated!' });
    }
  };

  if (loading)
    return (
      <div className="container mt-4">
        <h2 className="mb-4">Products Management</h2>
        <div className="row">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="col-md-3 mb-4">
              <div className="card h-100 text-center p-2">
                <div
                  className="bg-secondary rounded"
                  style={{ height: 200, opacity: 0.2 }}
                ></div>
                <div className="card-body">
                  <div className="bg-secondary rounded mb-2" style={{ height: 18, width: '60%', margin: '8px auto', opacity: 0.2 }}></div>
                  <div className="bg-secondary rounded mb-3" style={{ height: 14, width: '30%', margin: '8px auto', opacity: 0.2 }}></div>
                  <div className="d-flex justify-content-center gap-2">
                    <div className="bg-secondary rounded" style={{ width: 60, height: 30, opacity: 0.2 }}></div>
                    <div className="bg-secondary rounded" style={{ width: 60, height: 30, opacity: 0.2 }}></div>
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
        <h2 className="mb-0">Products Management</h2>
        <button 
          className="btn btn-outline-primary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="ri-add-line me-2"></i>
          Add Product
        </button>
      </div>

      {/* Alert Message */}
      {alertMessage && (
        <div 
          className={`alert alert-${alertMessage.type} alert-dismissible fade show`} 
          role="alert"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            minWidth: '300px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
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
                className="card-img-top"
                style={{ height: "200px", objectFit: "contain" }}
              />
              <div className="card-body d-flex flex-column flex-grow-1">
                <h5 className="card-title" style={{ 
                  minHeight: '3rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
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
                          Adding...
                        </>
                      ) : (
                        <>
                          <i className="ri-shopping-cart-line me-1"></i>
                          Add to Cart
                        </>
                      )}
                    </button>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary flex-fill"
                        onClick={() => setEditProduct(product)}
                      >
                        <i className="ri-edit-line me-1"></i>
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary flex-fill"
                        onClick={() => handleDelete(product.id!)}
                      >
                        <i className="ri-delete-bin-line me-1"></i>
                        Delete
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
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleAddProduct}>
                <div className="modal-header">
                  <h5 className="modal-title">Add New Product</h5>
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
                    <label htmlFor="productTitle" className="form-label">Title</label>
                    <input
                      id="productTitle"
                      type="text"
                      className="form-control"
                      placeholder="Enter product title"
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productPrice" className="form-label">Price</label>
                    <input
                      id="productPrice"
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="Enter product price"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: parseFloat(e.target.value || '0') })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Image</label>
                    <div className="d-flex gap-2 align-items-center">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => addFileRef.current?.click()}
                      >
                        <i className="ri-upload-cloud-line me-2"></i>
                        Upload Image
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
                          Image selected
                        </span>
                      )}
                    </div>
                    {newProduct.image && (
                      <div className="mt-2">
                        <small className="text-muted">Preview:</small>
                        <img 
                          src={newProduct.image} 
                          alt="Preview" 
                          style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', marginTop: '8px' }}
                          className="border rounded"
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
                    Add Product
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewProduct({ title: "", price: 0, image: "" });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ Edit Product Modal */}
      {editProduct && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleUpdateProduct}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Product</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditProduct(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editTitle" className="form-label">Title</label>
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
                    <label htmlFor="editPrice" className="form-label">Price</label>
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
                    <label className="form-label">Image</label>
                    <div className="d-flex gap-2 align-items-center">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => editFileRef.current?.click()}
                      >
                        <i className="ri-upload-cloud-line me-2"></i>
                        Upload Image
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
                          Image selected
                        </span>
                      )}
                    </div>
                    {editProduct.image && (
                      <div className="mt-2">
                        <small className="text-muted">Preview:</small>
                        <img 
                          src={editProduct.image} 
                          alt="Preview" 
                          style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', marginTop: '8px' }}
                          className="border rounded"
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
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditProduct(null)}
                  >
                    Cancel
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
