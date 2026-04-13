// src/services/cursoService.ts
import { api } from './api';

export interface Curso {
  id: number;
  nombre: string;
  codigo: string;
  creditos: number;
  horas_teoricas?: number;
  horas_practicas?: number;
  descripcion?: string;
  semestres?: Array<{ id: number; nombre: string; numero_semestre: number }>;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCursoDto {
  nombre: string;
  codigo: string;
  creditos?: number;
  horas_teoricas?: number;
  horas_practicas?: number;
  descripcion?: string;
  semestre_ids: number[];
}

export interface UpdateCursoDto {
  nombre?: string;
  codigo?: string;
  creditos?: number;
  horas_teoricas?: number;
  horas_practicas?: number;
  descripcion?: string;
  semestre_ids?: number[];
}

export const cursoService = {
  getAll: () => api.get<{ data: Curso[] }>('/cursos'),

  getById: (id: number) => api.get<{ data: Curso }>(`/cursos/${id}`),

  getBySemestre: (semestreId: number) =>
    api.get<{ data: Curso[] }>(`/semestres/${semestreId}/cursos`),

  create: (data: CreateCursoDto) =>
    api.post<{ data: Curso; message: string }>('/cursos', data),

  update: (id: number, data: UpdateCursoDto) =>
    api.put<{ data: Curso; message: string }>(`/cursos/${id}`, data),

  delete: (id: number) => api.delete<{ message: string }>(`/cursos/${id}`),
};
