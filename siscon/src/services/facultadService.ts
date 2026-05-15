import api from '../lib/axios';

export interface Facultad {
  id: number;
  nombre: string;
  codigo: string;
  director_nombre: string | null;
  director_genero: 'M' | 'F' | null;
  director_telefono: string | null;
  created_at?: string;
  updated_at?: string;
}

export const getFacultades = async (search?: string) => {
  const response = await api.get('/facultades', { params: { search } });
  return response.data;
};

export const createFacultad = async (data: Partial<Facultad>) => {
  const response = await api.post('/facultades', data);
  return response.data;
};

export const updateFacultad = async (id: number, data: Partial<Facultad>) => {
  const response = await api.put(`/facultades/${id}`, data);
  return response.data;
};

export const deleteFacultad = async (id: number) => {
  const response = await api.delete(`/facultades/${id}`);
  return response.data;
};
