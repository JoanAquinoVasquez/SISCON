// src/pages/Programas/index.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programaService, type Programa } from '../../services/programaService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ProgramaForm } from './ProgramaForm';

export default function ProgramasPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPrograma, setSelectedPrograma] = useState<Programa | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['programas'],
    queryFn: async () => {
      const response = await programaService.getAll();
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => programaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programas'] });
      showToast('Programa eliminado exitosamente', 'success');
    },
    onError: (error: Error) => {
      showToast(`Error: ${error.message}`, 'error');
    },
  });

  const createMutation = useMutation({
    mutationFn: programaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programas'] });
      showToast('Programa creado exitosamente', 'success');
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      showToast(`Error: ${error.message}`, 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      programaService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programas'] });
      showToast('Programa actualizado exitosamente', 'success');
      setIsFormOpen(false);
      setSelectedPrograma(null);
    },
    onError: (error: Error) => {
      showToast(`Error: ${error.message}`, 'error');
    },
  });

  const handleDelete = (programa: Programa) => {
    if (confirm(`¿Estás seguro de eliminar ${programa.nombre}?`)) {
      deleteMutation.mutate(programa.id);
    }
  };

  const handleCreate = () => {
    setSelectedPrograma(null);
    setIsFormOpen(true);
  };

  const handleEdit = (programa: Programa) => {
    setSelectedPrograma(programa);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (selectedPrograma) {
      updateMutation.mutate({ id: selectedPrograma.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando programas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Error al cargar programas: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Programas</h1>
          <p className="text-muted-foreground">Gestiona los programas académicos</p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Nuevo Programa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Programas</CardTitle>
          <CardDescription>
            Total: {data?.length || 0} programas registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((programa) => (
                <TableRow key={programa.id}>
                  <TableCell className="font-medium">{programa.id}</TableCell>
                  <TableCell>{programa.nombre}</TableCell>
                  <TableCell>{programa.descripcion || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleEdit(programa)}
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDelete(programa)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay programas registrados</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ProgramaForm
        programa={selectedPrograma}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedPrograma(null);
        }}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
