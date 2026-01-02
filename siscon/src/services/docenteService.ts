// src/services/docenteService.ts
import { api } from './api';

export interface Docente {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  genero: 'M' | 'F';
  dni: string;
  numero_telefono?: string;
  tipo_docente: 'interno' | 'externo' | 'interno_enfermeria' | 'externo_enfermeria';
  titulo_profesional?: string;
  lugar_procedencia_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDocenteDto {
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono?: string;
  direccion?: string;
  especialidad?: string;
  grado_academico?: string;
  titulo_profesional?: string;
}

export interface UpdateDocenteDto {
  nombres?: string;
  apellidos?: string;
  dni?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  especialidad?: string;
  grado_academico?: string;
  titulo_profesional?: string;
}

export const docenteService = {
  getAll: (params?: any) => api.get<any>('/docentes', { params }),
  
  getById: (id: number) => api.get<{ data: Docente }>(`/docentes/${id}`),
  
  create: (data: CreateDocenteDto) => api.post<{ data: Docente }>('/docentes', data),
  
  update: (id: number, data: UpdateDocenteDto) => 
    api.put<{ data: Docente }>(`/docentes/${id}`, data),
  
  delete: (id: number) => api.delete<{ message: string }>(`/docentes/${id}`),
};
