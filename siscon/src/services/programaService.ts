// src/services/programaService.ts
import { api } from './api';
import type { Semestre } from './semestreService';
import type { Curso } from './cursoService';

export interface Grado {
  id: number;
  nombre: string;
}

export interface Facultad {
  id: number;
  nombre: string;
  codigo?: string;
}

export interface Programa {
  id: number;
  nombre: string;
  descripcion?: string;
  periodo: string;
  grado_id: number;
  facultad_id?: number;
  grado?: Grado;
  facultad?: { id: number; nombre: string };
  semestres?: Semestre[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateProgramaDto {
  nombre: string;
  grado_id: number;
  periodo: string;
  facultad_id?: number;
  descripcion?: string;
}

export interface UpdateProgramaDto {
  nombre?: string;
  grado_id?: number;
  periodo?: string;
  facultad_id?: number;
  descripcion?: string;
}

export const programaService = {
  getAll: (params?: { grado_id?: number; periodo?: string; search?: string }) =>
    api.get<{ data: Programa[] }>('/programas', { params }),

  getById: (id: number) =>
    api.get<{ data: Programa }>(`/programas/${id}`),

  getSemestres: (id: number) =>
    api.get<{ data: Semestre[] }>(`/programas/${id}/semestres`),

  getCursos: (id: number) =>
    api.get<{ data: Curso[] }>(`/programas/${id}/cursos`),

  create: (data: CreateProgramaDto) =>
    api.post<{ data: Programa; message: string }>('/programas', data),

  update: (id: number, data: UpdateProgramaDto) =>
    api.put<{ data: Programa; message: string }>(`/programas/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/programas/${id}`),

  getGrados: () =>
    api.get<{ data: Grado[] }>('/grados-list'),

  getFacultades: () =>
    api.get<{ data: Facultad[] }>('/facultades-list'),
};
