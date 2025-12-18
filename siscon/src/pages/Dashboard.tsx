// src/pages/Dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, BookOpen, GraduationCap, Building2 } from 'lucide-react';
import { api } from '../services/api';

export function Dashboard() {
  // Fetch real statistics from API
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get<{ data: any[] }>('/users');
      return response.data;
    },
  });

  const { data: programasData } = useQuery({
    queryKey: ['programas'],
    queryFn: async () => {
      const response = await api.get<{ data: any[] }>('/programas');
      return response.data;
    },
  });

  const { data: cursosData } = useQuery({
    queryKey: ['cursos'],
    queryFn: async () => {
      const response = await api.get<{ data: any[] }>('/cursos');
      return response.data;
    },
  });

  const { data: docentesData } = useQuery({
    queryKey: ['docentes'],
    queryFn: async () => {
      const response = await api.get<{ data: any[] }>('/docentes');
      return response.data;
    },
  });

  const stats = [
    { 
      title: 'Usuarios', 
      value: usersData?.length?.toString() || '0', 
      icon: Users, 
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    { 
      title: 'Programas', 
      value: programasData?.length?.toString() || '0', 
      icon: Building2, 
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    { 
      title: 'Cursos', 
      value: cursosData?.length?.toString() || '0', 
      icon: BookOpen, 
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    { 
      title: 'Docentes', 
      value: docentesData?.length?.toString() || '0', 
      icon: GraduationCap, 
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50'
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-blue-100">Bienvenido al Sistema de Contabilidad SISCON</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`hover-lift bg-gradient-to-br ${stat.bgGradient} border-0 shadow-md`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
                <p className="text-xs text-slate-600 mt-1">Total registrados</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-md border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800">Inicio Rápido</CardTitle>
          <CardDescription>
            Comienza a gestionar tu sistema de contabilidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Usa el menú lateral para navegar entre las diferentes secciones del sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}