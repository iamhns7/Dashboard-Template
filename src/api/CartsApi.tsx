import axios from "axios";
import type { Cart } from "../interfaces/CartInterfaces";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 🟩 GET — Tüm cart'ları getir
export const getAllCarts = async (): Promise<Cart[]> => {
  const res = await axios.get(`${API_BASE_URL}/carts`);
  return res.data;
};

// 🟦 POST — Yeni bir cart ekle
export const createCart = async (cart: Partial<Cart>): Promise<Cart> => {
  const res = await axios.post(`${API_BASE_URL}/carts`, cart, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

// 🟨 PUT — Mevcut bir cart'ı güncelle
export const updateCart = async (id: number, cart: Partial<Cart>): Promise<Cart> => {
  const res = await axios.put(`${API_BASE_URL}/carts/${id}`, cart, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

// 🟥 DELETE — Cart sil
export const deleteCart = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/carts/${id}`);
};
