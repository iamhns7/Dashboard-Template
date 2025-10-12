import { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/ProductsApi";
import type { Product } from "../interfaces/ProductInterfaces";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [newProduct, setNewProduct] = useState<Product>({ title: "", price: 0 });
  const [editProduct, setEditProduct] = useState<Product | null>(null);

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
      const added = await createProduct(newProduct);
      setProducts([...products, added]);
      setNewProduct({ title: "", price: 0 });
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // ✅ Delete product
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // ✅ Update product
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct?.id) return;
    try {
      const updated = await updateProduct(editProduct.id, editProduct);
      setProducts(
        products.map((p) => (p.id === updated.id ? updated : p))
      );
      setEditProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
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
      <h2 className="mb-4">Products Management</h2>

      {/* ➕ Add Product Form */}
      <form onSubmit={handleAddProduct} className="mb-4">
        <div className="row g-2">
          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="Title"
              value={newProduct.title}
              onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
              }
              required
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">
              Add
            </button>
          </div>
        </div>
      </form>

      {/* 📋 Products List */}
      <div className="row">
        {products.map((product) => (
          <div key={product.id} className="col-md-3 mb-4">
            <div className="card h-100 text-center p-2">
              <img
                src={product.image}
                alt={product.title}
                className="card-img-top"
                style={{ height: "200px", objectFit: "contain" }}
              />
              <div className="card-body">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text">${product.price}</p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => setEditProduct(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(product.id!)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✏️ Edit Product Modal */}
      {editProduct && (
        <div className="modal show d-block" tabIndex={-1}>
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
                  <input
                    type="text"
                    className="form-control mb-3"
                    value={editProduct.title}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, title: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    className="form-control"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        price: parseFloat(e.target.value),
                      })
                    }
                  />
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
