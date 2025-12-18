// src/pages/Docentes/index.tsx
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
import { docenteService, type Docente } from '../../services/docenteService';
import { DocenteForm } from './DocenteForm';
import { useToast } from '../../context/ToastContext';

export function DocentesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: docentes, isLoading, error } = useQuery({
    queryKey: ['docentes'],
    queryFn: async () => {
      const response = await docenteService.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: docenteService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docentes'] });
      setIsFormOpen(false);
      showToast('Docente creado exitosamente', 'success');
    },
    onError: () => {
      showToast('Error al crear docente', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      docenteService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docentes'] });
      setIsFormOpen(false);
      setSelectedDocente(null);
      showToast('Docente actualizado exitosamente', 'success');
    },
    onError: () => {
      showToast('Error al actualizar docente', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: docenteService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docentes'] });
      showToast('Docente eliminado exitosamente', 'success');
    },
    onError: () => {
      showToast('Error al eliminar docente', 'error');
    },
  });

  const handleCreate = () => {
    setSelectedDocente(null);
    setIsFormOpen(true);
  };

  const handleEdit = (docente: Docente) => {
    setSelectedDocente(docente);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este docente?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: any) => {
    if (selectedDocente) {
      updateMutation.mutate({ id: selectedDocente.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getTipoDocenteLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      interno: 'Interno',
      externo: 'Externo',
      interno_enfermeria: 'Interno Enfermería',
      externo_enfermeria: 'Externo Enfermería',
    };
    return labels[tipo] || tipo;
  };

  const getFullName = (docente: Docente) => {
    const titulo = docente.titulo_profesional ? `${docente.titulo_profesional} ` : '';
    return `${titulo}${docente.nombres} ${docente.apellido_paterno} ${docente.apellido_materno}`;
  };

  if (isLoading) {
    return <div className="p-8">Cargando docentes...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error al cargar docentes</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Docentes</h1>
          <p className="text-slate-600 mt-1">Gestiona los docentes del sistema</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Docente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Docentes</CardTitle>
          <CardDescription>
            Total de docentes registrados: {docentes?.length || 0}
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
              {docentes?.map((docente) => (
                <TableRow key={docente.id}>
                  <TableCell className="font-medium">
                    {getFullName(docente)}
                  </TableCell>
                  <TableCell>{docente.dni}</TableCell>
                  <TableCell>{docente.genero === 'M' ? 'Masculino' : 'Femenino'}</TableCell>
                  <TableCell>{docente.numero_telefono || '-'}</TableCell>
                  <TableCell>{getTipoDocenteLabel(docente.tipo_docente)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(docente)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(docente.id)}
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

      <DocenteForm
        docente={selectedDocente}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedDocente(null);
        }}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
