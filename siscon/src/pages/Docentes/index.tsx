// src/pages/Docentes/index.tsx
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
import { docenteService, type Docente } from '../../services/docenteService';
import { DocenteForm } from './DocenteForm';
import { useToast } from '../../context/ToastContext';

export function DocentesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState<string>('todos');
  const [genero, setGenero] = useState<string>('todos');
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useQuery({
    queryKey: ['docentes', page, search, tipo, genero],
    queryFn: async () => {
      const params: any = { page, per_page: 10 };
      if (search) params.search = search;
      if (tipo && tipo !== 'todos') params.tipo_docente = tipo;
      if (genero && genero !== 'todos') params.genero = genero;

      const res = await docenteService.getAll(params);
      return res.current_page ? res : { data: res.data, current_page: 1, last_page: 1, total: res.data.length, from: 1, to: res.data.length };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const docentes = response?.data || [];
  const pagination = response ? {
    current_page: response.current_page,
    last_page: response.last_page,
    total: response.total,
    from: response.from,
    to: response.to
  } : null;

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

  const getCursosAsignados = (docente: Docente) => {
    if (!docente.pagos || docente.pagos.length === 0) {
      return <span className="text-slate-400 italic">Sin asignación</span>;
    }

    // Extract unique courses from payments
    const cursosMap = new Map();

    docente.pagos.forEach((pago: any) => {
      if (pago.curso) {
        // Find program for this period
        const semestre = pago.curso.semestres?.find((s: any) => s.programa?.periodo === pago.periodo);
        const programa = semestre?.programa;

        const key = `${pago.curso.id}-${pago.periodo}`;
        if (!cursosMap.has(key)) {
          cursosMap.set(key, {
            grado: programa?.grado?.nombre || 'Grado',
            curso: pago.curso.nombre,
            programa: programa?.nombre || 'Programa',
            periodo: pago.periodo
          });
        }
      }
    });

    const cursos = Array.from(cursosMap.values());

    if (cursos.length === 0) {
      return <span className="text-slate-400 italic">Sin asignación</span>;
    }

    return (
      <div className="flex flex-col gap-1">
        {cursos.map((item: any, index) => (
          <div key={index} className="text-xs">
            <span className="font-medium text-slate-700">{item.curso}</span>
            <div className="text-slate-500 ml-1">
              {item.grado} en {item.programa} ({item.periodo})
            </div>
          </div>
        ))}
      </div>
    );
  };

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

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI..."
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
            <SelectItem value="interno_enfermeria">Interno Enfermería</SelectItem>
            <SelectItem value="externo_enfermeria">Externo Enfermería</SelectItem>
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
          <CardTitle>Lista de Docentes</CardTitle>
          <CardDescription>
            Total de docentes registrados: {pagination?.total || 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Cod.</TableHead>
                  <TableHead className="min-w-[250px]">Nombre Completo</TableHead>
                  <TableHead className="min-w-[300px]">Curso Asignado</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                        Cargando docentes...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : docentes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No hay docentes registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  docentes.map((docente: Docente) => (
                    <TableRow key={docente.id}>
                      <TableCell className="font-medium text-slate-500">
                        {docente.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getFullName(docente)}
                      </TableCell>
                      <TableCell>
                        {getCursosAsignados(docente)}
                      </TableCell>
                      <TableCell>{docente.dni}</TableCell>
                      <TableCell>{docente.numero_telefono || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${docente.tipo_docente.includes('interno')
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                          }`}>
                          {getTipoDocenteLabel(docente.tipo_docente)}
                        </span>
                      </TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {
            pagination && pagination.last_page > 1 && (
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
            )
          }
        </CardContent >
      </Card >

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
    </div >
  );
}
