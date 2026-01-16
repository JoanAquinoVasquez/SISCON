import { api } from "./api";

export interface Devolucion {
  id: number;
  persona: string;
  dni: string;
  programa_id: number;
  programa_nombre?: string;
  proceso_admision: string;
  tipo_devolucion: "inscripcion" | "idiomas" | "grados_titulos";
  tipo_devolucion_label?: string;
  importe: number;
  numero_voucher: string;
  estado: "pendiente" | "aprobado" | "rechazado" | "procesado";
  estado_label?: string;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DevolucionFilters {
  search?: string;
  tipo_devolucion?: string;
  estado?: string;
  programa_id?: number;
  page?: number;
}

export const getDevoluciones = async (filters: DevolucionFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.tipo_devolucion)
    params.append("tipo_devolucion", filters.tipo_devolucion);
  if (filters.estado) params.append("estado", filters.estado);
  if (filters.programa_id)
    params.append("programa_id", filters.programa_id.toString());
  if (filters.page) params.append("page", filters.page.toString());

  const response = await api.get<any>(`/devoluciones?${params.toString()}`);
  return response;
};

export const getDevolucion = async (id: number) => {
  const response = await api.get<any>(`/devoluciones/${id}`);
  return response.data;
};

export const createDevolucion = async (data: Partial<Devolucion>) => {
  const response = await api.post<any>("/devoluciones", data);
  return response.data;
};

export const updateDevolucion = async (
  id: number,
  data: Partial<Devolucion>
) => {
  const response = await api.put<any>(`/devoluciones/${id}`, data);
  return response.data;
};

export const deleteDevolucion = async (id: number) => {
  const response = await api.delete<any>(`/devoluciones/${id}`);
  return response.data;
};

export const updateEstadoDevolucion = async (
  id: number,
  estado: string,
  observaciones?: string
) => {
  const response = await api.patch<any>(`/devoluciones/${id}/estado`, {
    estado,
    observaciones,
  });
  return response.data;
};
