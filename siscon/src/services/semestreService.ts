// src/services/semestreService.ts
import { api } from './api';
import type { Curso } from './cursoService';

export interface Semestre {
  id: number;
  programa_id: number;
  numero_semestre: number;
  nombre: string;
  descripcion?: string;
  cursos?: Curso[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateSemestreDto {
  programa_id: number;
  numero_semestre: number;
  nombre: string;
  descripcion?: string;
}

export const semestreService = {
  getAll: (params?: { programa_id?: number }) =>
    api.get<{ data: Semestre[] }>('/semestres', { params }),

  getByPrograma: (programaId: number) =>
    api.get<{ data: Semestre[] }>(`/semestres/by-programa/${programaId}`),

  getById: (id: number) =>
    api.get<{ data: Semestre }>(`/semestres/${id}`),

  getCursos: (id: number) =>
    api.get<{ data: Curso[] }>(`/semestres/${id}/cursos`),

  create: (data: CreateSemestreDto) =>
    api.post<{ data: Semestre; message: string }>('/semestres', data),

  update: (id: number, data: Partial<CreateSemestreDto>) =>
    api.put<{ data: Semestre; message: string }>(`/semestres/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/semestres/${id}`),
};
