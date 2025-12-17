// src/services/programaService.ts
import { api } from './api';

export interface Programa {
  id: number;
  nombre: string;
  descripcion?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProgramaDto {
  nombre: string;
  descripcion?: string;
}

export interface UpdateProgramaDto {
  nombre?: string;
  descripcion?: string;
}

export const programaService = {
  getAll: () => api.get<{ data: Programa[] }>('/programas'),
  
  getById: (id: number) => api.get<{ data: Programa }>(`/programas/${id}`),
  
  create: (data: CreateProgramaDto) => api.post<{ data: Programa }>('/programas', data),
  
  update: (id: number, data: UpdateProgramaDto) => 
    api.put<{ data: Programa }>(`/programas/${id}`, data),
  
  delete: (id: number) => api.delete<{ message: string }>(`/programas/${id}`),
};
