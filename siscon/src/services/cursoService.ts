// src/services/cursoService.ts
import { api } from './api';

export interface Curso {
  id: number;
  nombre: string;
  codigo: string;
  creditos: number;
  horas_teoricas?: number;
  horas_practicas?: number;
  semestre_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCursoDto {
  nombre: string;
  codigo: string;
  creditos: number;
  horas_teoricas?: number;
  horas_practicas?: number;
  semestre_id?: number;
}

export interface UpdateCursoDto {
  nombre?: string;
  codigo?: string;
  creditos?: number;
  horas_teoricas?: number;
  horas_practicas?: number;
  semestre_id?: number;
}

export const cursoService = {
  getAll: () => api.get<{ data: Curso[] }>('/cursos'),
  
  getById: (id: number) => api.get<{ data: Curso }>(`/cursos/${id}`),
  
  create: (data: CreateCursoDto) => api.post<{ data: Curso }>('/cursos', data),
  
  update: (id: number, data: UpdateCursoDto) => 
    api.put<{ data: Curso }>(`/cursos/${id}`, data),
  
  delete: (id: number) => api.delete<{ message: string }>(`/cursos/${id}`),
};
