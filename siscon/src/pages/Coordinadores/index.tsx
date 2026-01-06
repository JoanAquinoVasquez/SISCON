// src/pages/Coordinadores/index.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
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
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { coordinadorService, type Coordinador } from '../../services/coordinadorService';
import { CoordinadorForm } from './CoordinadorForm';
import { useToast } from '../../context/ToastContext';

export function CoordinadoresPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoordinador, setSelectedCoordinador] = useState<Coordinador | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState<string>('todos');
  const [genero, setGenero] = useState<string>('todos');
  const [page, setPage] = useState(1);

  const { data: response, isLoading, isFetching, error } = useQuery({
    queryKey: ['coordinadores', page, search, tipo, genero],
    queryFn: async () => {
      const params: any = { page, per_page: 10 };
      if (search) params.search = search;
      if (tipo && tipo !== 'todos') params.tipo_coordinador = tipo;
      if (genero && genero !== 'todos') params.genero = genero;

      const res = await coordinadorService.getAll(params);
      return res.current_page ? res : { data: res.data, current_page: 1, last_page: 1, total: res.data.length, from: 1, to: res.data.length };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const coordinadores = response?.data || [];
  const pagination = response ? {
    current_page: response.current_page,
    last_page: response.last_page,
    total: response.total,
    from: response.from,
    to: response.to
  } : null;

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
    return <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Cargando coordinadores...</p>
      </div>
    </div>;
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

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, apellidos..."
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          value={tipo}
          onValueChange={(value) => { setTipo(value); setPage(1); }}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="interno">Interno</SelectItem>
            <SelectItem value="externo">Externo</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={genero}
          onValueChange={(value) => { setGenero(value); setPage(1); }}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Género" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="M">Masculino</SelectItem>
            <SelectItem value="F">Femenino</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Coordinadores</CardTitle>
          <CardDescription>
            Total de coordinadores registrados: {pagination?.total || 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isFetching && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
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
                {coordinadores.map((coordinador: Coordinador) => (
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
          </div>

          {coordinadores.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay coordinadores registrados</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between mt-4 border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {pagination.from} a {pagination.to} de {pagination.total} registros
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                  disabled={page === pagination.last_page}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
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
