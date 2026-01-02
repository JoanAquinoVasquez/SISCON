// src/services/coordinadorService.ts
import { api } from './api';

export interface Coordinador {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  titulo_profesional?: string;
  genero: 'M' | 'F';
  dni?: string;
  numero_telefono?: string;
  tipo_coordinador: 'interno' | 'externo';
  created_at: string;
  updated_at: string;
}

export interface CreateCoordinadorDto {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  titulo_profesional?: string;
  genero: 'M' | 'F';
  dni?: string;
  numero_telefono?: string;
  tipo_coordinador: 'interno' | 'externo';
}

export interface UpdateCoordinadorDto extends Partial<CreateCoordinadorDto> {}

export const coordinadorService = {
  getAll: (params?: any) => api.get<any>('/coordinadores', { params }),
  getById: (id: number) => api.get<{ data: Coordinador }>(`/coordinadores/${id}`),
  create: (data: CreateCoordinadorDto) => api.post<{ data: Coordinador }>('/coordinadores', data),
  update: (id: number, data: UpdateCoordinadorDto) => api.put<{ data: Coordinador }>(`/coordinadores/${id}`, data),
  delete: (id: number) => api.delete(`/coordinadores/${id}`),
};
