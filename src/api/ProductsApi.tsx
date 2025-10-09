import axios from "axios";
import type { Product } from "../interfaces/ProductInterfaces";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ GET - get all products
export const getProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${API_BASE_URL}/products`);
  return response.data;
};

// ✅ POST - create new product
export const createProduct = async (product: Product): Promise<Product> => {
  const response = await axios.post(`${API_BASE_URL}/products`, product);
  return response.data;
};

// ✅ PUT - update existing product
export const updateProduct = async (id: number, product: Product): Promise<Product> => {
  const response = await axios.put(`${API_BASE_URL}/products/${id}`, product);
  return response.data;
};

// ✅ DELETE - delete product
export const deleteProduct = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/products/${id}`);
};
