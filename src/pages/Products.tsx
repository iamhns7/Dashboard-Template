import { useEffect, useRef, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/ProductsApi";
import type { Product } from "../interfaces/ProductInterfaces";
import { useCart } from "../hooks/useCart";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [newProduct, setNewProduct] = useState<Product>({ title: "", price: 0, image: "" });
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'danger', text: string } | null>(null);
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

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Load all products
  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add new product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare payload: do not send base64 data URLs to server (they may reject large payloads)
      const payload: Partial<Product> = {
        title: newProduct.title,
        price: newProduct.price,
        description: newProduct.description,
        category: newProduct.category,
      };
      if (newProduct.image && !newProduct.image.startsWith("data:")) {
        payload.image = newProduct.image;
      }

      const added = await createProduct(payload as Product);
      // Merge local image for UI if we omitted it from payload (e.g. data URL)
      const finalAdded: Product = { ...(added as Product), image: added.image || newProduct.image };
      setProducts([...products, finalAdded]);
      setNewProduct({ title: "", price: 0, image: "" });
      setShowAddModal(false);
      setAlertMessage({ type: 'success', text: '✅ Product added successfully!' });
    } catch (error) {
      console.error("Error adding product:", error);
      setAlertMessage({ type: 'danger', text: '❌ Failed to add product!' });
    }
  };

  // ✅ Delete product
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      setAlertMessage({ type: 'success', text: '✅ Product deleted successfully!' });
    } catch (error) {
      console.error("Error deleting product:", error);
      setAlertMessage({ type: 'danger', text: '❌ Failed to delete product!' });
    }
  };

  // 🛒 Add product to cart
  const handleAddToCart = (product: Product) => {
    if (product.id) {
      addToCart(product.id, 1);
      setAlertMessage({ type: 'success', text: `✅ ${product.title} added to cart!` });
    }
  };

  // ✅ Update product
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct?.id) return;
    try {
      // Prepare payload: avoid sending base64 data URLs
      const payload: Partial<Product> = {
        title: editProduct.title,
        price: editProduct.price,
        description: editProduct.description,
        category: editProduct.category,
      };
      if (editProduct.image && !editProduct.image.startsWith("data:")) {
        payload.image = editProduct.image;
      }

      const updated = await updateProduct(editProduct.id, payload as Product);
      const finalUpdated: Product = { ...(updated as Product), image: updated.image || editProduct.image };
      setProducts(products.map((p) => (p.id === finalUpdated.id ? finalUpdated : p)));
      setEditProduct(null);
      setAlertMessage({ type: 'success', text: '✅ Product updated successfully!' });
    } catch (error) {
      console.error("Error updating product:", error);
      setAlertMessage({ type: 'danger', text: '❌ Failed to update product!' });
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
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "contain" }}
                />
              ) : (
                <div
                  className="bg-light"
                  style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span className="text-muted">No image</span>
                </div>
              )}
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
                    >
                      <i className="ri-shopping-cart-line me-1"></i>
                      Add to Cart
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
                    <label htmlFor="productImage" className="form-label">Image</label>
                    <div className="input-group">
                      <input
                        id="productImage"
                        type="text"
                        className="form-control"
                        placeholder="Image URL or choose file"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => addFileRef.current?.click()}
                        title="Choose file"
                      >
                        📁
                      </button>
                      <input
                        ref={addFileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            setNewProduct({ ...newProduct, image: String(reader.result) });
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </div>
                    {newProduct.image && (
                      <div className="mt-2">
                        <img 
                          src={newProduct.image} 
                          alt="Preview" 
                          style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                          className="border rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-success">
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
                    <label htmlFor="editImage" className="form-label">Image</label>
                    <div className="input-group">
                      <input
                        id="editImage"
                        type="text"
                        className="form-control"
                        placeholder="Image URL or choose file"
                        value={editProduct.image ?? ""}
                        onChange={(e) =>
                          setEditProduct({ ...editProduct, image: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => editFileRef.current?.click()}
                        title="Choose file"
                      >
                        📁
                      </button>
                      <input
                        ref={editFileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            setEditProduct({ ...editProduct, image: String(reader.result) });
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </div>
                    {editProduct.image && (
                      <div className="mt-2">
                        <img 
                          src={editProduct.image} 
                          alt="Preview" 
                          style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                          className="border rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-success">
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
