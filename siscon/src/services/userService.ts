// src/services/userService.ts
import { api } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: 'admin' | 'user';
  is_active?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  is_active?: boolean;
}

export const userService = {
  getAll: (params?: any) => api.get<any>('/users', { params }),
  
  getById: (id: number) => api.get<{ data: User }>(`/users/${id}`),
  
  create: (data: CreateUserDto) => api.post<{ data: User }>('/users', data),
  
  update: (id: number, data: UpdateUserDto) => 
    api.put<{ data: User }>(`/users/${id}`, data),
  
  delete: (id: number) => api.delete<{ message: string }>(`/users/${id}`),
};
