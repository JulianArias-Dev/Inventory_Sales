import api from "./api";

export const getProductos = async () => {
  const response = await api.get("/producto");
  return response.data;
};

export const getProductoById = async (id) => {
  const response = await api.get(`/producto/${id}`);
  return response.data;
};