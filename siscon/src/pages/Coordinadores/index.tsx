// src/pages/Coordinadores/index.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { coordinadorService, type Coordinador } from '../../services/coordinadorService';
import { CoordinadorForm } from './CoordinadorForm';
import { useToast } from '../../context/ToastContext';

export function CoordinadoresPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoordinador, setSelectedCoordinador] = useState<Coordinador | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: coordinadores, isLoading, error } = useQuery({
    queryKey: ['coordinadores'],
    queryFn: async () => {
      const response = await coordinadorService.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: coordinadorService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinadores'] });
      setIsFormOpen(false);
      showToast('Coordinador creado exitosamente', 'success');
    },
    onError: () => {
      showToast('Error al crear coordinador', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      coordinadorService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinadores'] });
      setIsFormOpen(false);
      setSelectedCoordinador(null);
      showToast('Coordinador actualizado exitosamente', 'success');
    },
    onError: () => {
      showToast('Error al actualizar coordinador', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: coordinadorService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinadores'] });
      showToast('Coordinador eliminado exitosamente', 'success');
    },
    onError: () => {
      showToast('Error al eliminar coordinador', 'error');
    },
  });

  const handleCreate = () => {
    setSelectedCoordinador(null);
    setIsFormOpen(true);
  };

  const handleEdit = (coordinador: Coordinador) => {
    setSelectedCoordinador(coordinador);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este coordinador?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: any) => {
    if (selectedCoordinador) {
      updateMutation.mutate({ id: selectedCoordinador.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getFullName = (coordinador: Coordinador) => {
    const titulo = coordinador.titulo_profesional ? `${coordinador.titulo_profesional} ` : '';
    return `${titulo}${coordinador.nombres} ${coordinador.apellido_paterno} ${coordinador.apellido_materno}`;
  };

  if (isLoading) {
    return <div className="p-8">Cargando coordinadores...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error al cargar coordinadores</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Coordinadores</h1>
          <p className="text-slate-600 mt-1">Gestiona los coordinadores de programas</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Coordinador
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Coordinadores</CardTitle>
          <CardDescription>
            Total de coordinadores registrados: {coordinadores?.length || 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Género</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coordinadores?.map((coordinador) => (
                <TableRow key={coordinador.id}>
                  <TableCell className="font-medium">
                    {getFullName(coordinador)}
                  </TableCell>
                  <TableCell>{coordinador.dni || '-'}</TableCell>
                  <TableCell>{coordinador.genero === 'M' ? 'Masculino' : 'Femenino'}</TableCell>
                  <TableCell>{coordinador.numero_telefono || '-'}</TableCell>
                  <TableCell className="capitalize">{coordinador.tipo_coordinador}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(coordinador)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(coordinador.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CoordinadorForm
        coordinador={selectedCoordinador}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCoordinador(null);
        }}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
