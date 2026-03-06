import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../../lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from '@/hooks/useDebounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreVertical,
  Download,
  Upload,
  FileIcon,
  X,
  CheckCircle,
} from 'lucide-react';

// Función para formatear fechas en formato legible
const formatearFechasLegibles = (fechas: string[]): string => {
  if (!fechas || fechas.length === 0) return '';

  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  // Agrupar fechas por mes y año
  const fechasPorMesAnio: Record<string, number[]> = {};

  fechas.forEach(fecha => {
    const [year, month, day] = fecha.split('-').map(Number);
    const key = `${month - 1}-${year}`;

    if (!fechasPorMesAnio[key]) {
      fechasPorMesAnio[key] = [];
    }
    fechasPorMesAnio[key].push(day);
  });

  // Construir el texto formateado
  const grupos = Object.entries(fechasPorMesAnio)
    .sort(([keyA], [keyB]) => {
      const [mA, yA] = keyA.split('-').map(Number);
      const [mB, yB] = keyB.split('-').map(Number);
      return yA !== yB ? yA - yB : mA - mB;
    })
    .map(([key, dias]) => {
      const [mes] = key.split('-').map(Number);
      dias.sort((a, b) => a - b);
      return `${dias.join(', ')} de ${meses[mes]}`;
    });

  return grupos.join(', ');
};

interface PagoDocente {
  id: number;
  docente_nombre: string;
  docente_dni: string;
  tipo_docente: string;
  curso_nombre: string;
  programa_nombre: string;
  periodo: string;
  numero_horas: number;
  costo_por_hora: number;
  importe_total: number;
  importe_letras: string;
  estado: string;
  created_at: string;
  // Campos adicionales para detalle
  numero_informe_final?: string;
  numero_informe_final_url?: string;
  numero_recibo_honorario?: string;
  numero_recibo_honorario_url?: string;
  numero_oficio_presentacion_facultad?: string;
  numero_oficio_presentacion_coordinador?: string;
  numero_oficio_presentacion_direccion?: string;
  numero_oficio_conformidad_facultad?: string;
  numero_oficio_conformidad_coordinador?: string;
  numero_oficio_conformidad_direccion?: string;
  numero_resolucion_aprobacion?: string;
  fecha_resolucion_aprobacion?: string;
  numero_resolucion_pago?: string;
  numero_oficio_contabilidad?: string;
  numero_expediente_nota_pago?: string;
  numero_expediente_nota_pago_url?: string;
  facultad_codigo?: string;
  grado_nombre?: string;
  docente?: {
    titulo_profesional?: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    dni: string;
    tipo_docente?: string;
  };
  curso?: {
    nombre: string;
    codigo: string;
  };
  fechas_ensenanza?: string[];
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function PagosDocentesList() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const exactId = queryParams.get('highlight_id') || '';

  const [pagos, setPagos] = useState<PagoDocente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [exactIdFilter, setExactIdFilter] = useState(exactId);
  const [filters, setFilters] = useState({
    periodo: '',
    tipo_docente: '',
    programa_id: '',
    estado: ''
  });
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [page, setPage] = useState(1);
  const [totalImporte, setTotalImporte] = useState(0);

  const debouncedSearch = useDebounce(search, 500);

  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedPago, setSelectedPago] = useState<PagoDocente | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Modal de Cambio de Estado
  const [isEstadoOpen, setIsEstadoOpen] = useState(false);
  const [loadingEstado, setLoadingEstado] = useState(false);
  const [estadoForm, setEstadoForm] = useState({
    id: 0,
    estado: 'pendiente',
    file: null as File | null
  });

  const fetchPagos = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        ...filters
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (exactIdFilter) params.id = exactIdFilter;

      const response = await axios.get('/pagos-docentes', { params });
      setPagos(response.data.data.data);
      setTotalImporte(response.data.total_importe);
      setPagination({
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        per_page: response.data.data.per_page,
        total: response.data.data.total,
        from: response.data.data.from,
        to: response.data.data.to
      });
    } catch (error) {
      console.error('Error al cargar pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, [page, debouncedSearch, filters, exactIdFilter]);

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      try {
        await axios.delete(`/pagos-docentes/${id}`);
        fetchPagos();
      } catch (error) {
        console.error('Error al eliminar:', error);
        toast.error('Error al eliminar el registro');
      }
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      setLoadingDetail(true);
      setIsDetailOpen(true);
      const response = await axios.get(`/pagos-docentes/${id}`);
      setSelectedPago(response.data.data);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      toast.error('Error al cargar los detalles del pago');
      setIsDetailOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSaveEstado = async () => {
    try {
      setLoadingEstado(true);
      const formData = new FormData();
      formData.append('estado', estadoForm.estado);
      if (estadoForm.file) {
        formData.append('file', estadoForm.file);
      }

      await axios.post(`/pagos-docentes/${estadoForm.id}/actualizar-estado`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Estado actualizado correctamente');
      setIsEstadoOpen(false);
      setEstadoForm({ id: 0, estado: 'pendiente', file: null });
      fetchPagos();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error al actualizar el estado');
    } finally {
      setLoadingEstado(false);
    }
  };

  // Generar resolución
  const [isGeneratingResolucion, setIsGeneratingResolucion] = useState(false);
  const handleGenerateResolucion = async (id: number) => {
    setIsGeneratingResolucion(true);
    try {
      const response = await axios.post(
        `/pagos-docentes/${id}/generar-resolucion`,
        {},
        { responseType: 'blob' }
      );

      // Extraer nombre de archivo del header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let filename = `Resolucion_${id}.docx`; // Fallback
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;\n]+)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Resolución generada exitosamente');
    } catch (error) {
      console.error('Error al generar resolución:', error);
      toast.error('Error al generar la resolución');
    } finally {
      setIsGeneratingResolucion(false);
    }
  };

  // Generar oficio de contabilidad
  const [isGeneratingOficio, setIsGeneratingOficio] = useState(false);
  const handleGenerateOficio = async (id: number) => {
    setIsGeneratingOficio(true);
    try {
      const response = await axios.post(
        `/pagos-docentes/${id}/generar-oficio`,
        {},
        { responseType: 'blob' }
      );

      // Extraer nombre de archivo del header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let filename = `Oficio_Conta_${id}.docx`; // Fallback
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;\n]+)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Oficio generado exitosamente');
    } catch (error) {
      console.error('Error al generar oficio:', error);
      toast.error('Error al generar el oficio');
    } finally {
      setIsGeneratingOficio(false);
    }
  };

  // Generar resolución de aceptación (Nueva función)
  const [isGeneratingResolucionAceptacion, setIsGeneratingResolucionAceptacion] = useState(false);
  const handleGenerateResolucionAceptacion = async (id: number) => {
    setIsGeneratingResolucionAceptacion(true);
    try {
      const response = await axios.post(
        `/pagos-docentes/${id}/generar-resolucion-aceptacion`,
        {},
        { responseType: 'blob' }
      );

      // Extraer nombre de archivo del header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let filename = `Resolucion_Aceptacion_${id}.docx`; // Fallback
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;\n]+)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Resolución de Aprobación generada exitosamente');
    } catch (error) {
      console.error('Error al generar resolución:', error);
      toast.error('Error al generar la resolución de aprobación');
    } finally {
      setIsGeneratingResolucionAceptacion(false);
    }
  };

  // Exportar Excel
  const [isExporting, setIsExporting] = useState(false);
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const params = { ...filters };
      const response = await axios.get('/pagos-docentes/exportar-excel', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Pagos_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar el reporte');
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewOficioPagoContabilidad = (numero_expediente_nota_pago_url: string) => {
    // Redirigir al link donde está subido el archivo numero_expediente_nota_pago_url
    window.open(numero_expediente_nota_pago_url, '_blank');
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'en_proceso':
        return <Badge variant="secondary">En Proceso</Badge>;
      case 'observado':
        return <Badge variant="tertiary">Observado</Badge>;
      case 'aprobado':
        return <Badge variant="default">Aprobado</Badge>;
      case 'completado':
      case 'finalizado':
        return <Badge variant="success">Finalizado</Badge>;
      case 'rechazado':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagos Docentes</h1>
          <p className="text-muted-foreground">
            Gestión de pagos y expedientes de docentes
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-md font-bold mr-2">
            Total: S/ {Number(totalImporte).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <Button variant="outline" onClick={handleExportExcel} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Exportar Excel
          </Button>
          <Button onClick={() => navigate('/pagos-docentes/nuevo')}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Pago
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por docente, DNI o curso..."
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Input
          placeholder="Periodo (ej. 2024-I)"
          className="w-full md:w-40"
          value={filters.periodo}
          onChange={(e) => { setFilters({ ...filters, periodo: e.target.value }); setPage(1); }}
        />
        <Select
          value={filters.tipo_docente}
          onValueChange={(value) => { setFilters({ ...filters, tipo_docente: value }); setPage(1); }}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Tipo Docente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos"><span>Todos</span></SelectItem>
            <SelectItem value="interno"><span>Interno</span></SelectItem>
            <SelectItem value="externo"><span>Externo</span></SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.estado}
          onValueChange={(value) => { setFilters({ ...filters, estado: value === 'todos' ? '' : value }); setPage(1); }}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos"><span>Todos</span></SelectItem>
            <SelectItem value="pendiente"><span>Pendiente</span></SelectItem>
            <SelectItem value="en_proceso"><span>En Proceso</span></SelectItem>
            <SelectItem value="completado"><span>Completado</span></SelectItem>
            <SelectItem value="rechazado"><span>Rechazado</span></SelectItem>
          </SelectContent>
        </Select>
      </div>

      {exactIdFilter && (
        <div className="bg-amber-100/80 border border-amber-300 text-amber-800 px-4 py-3 rounded-md flex items-center justify-between mt-4">
          <div className="flex items-center">
            <span className="font-semibold mr-2">Filtro Exacto:</span>
            <span>Mostrando únicamente el registro asociado al expediente.</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-amber-200/50"
            onClick={() => {
              setExactIdFilter('');
              navigate('/pagos-docentes', { replace: true });
            }}
          >
            Quitar filtro y ver todos
          </Button>
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Cód.</TableHead>
              <TableHead className="text-center min-w-[175px]">Docente</TableHead>
              <TableHead className="text-center min-w-[300px]">Curso</TableHead>
              <TableHead className="text-center min-w-[250px]">Presentación</TableHead>
              <TableHead className="text-center min-w-[170px]">Aprobación</TableHead>
              <TableHead className="text-center min-w-[200px]">Conformidad</TableHead>
              <TableHead className="text-center min-w-[220px]">Documentos Generados</TableHead>
              <TableHead className="text-right min-w-[100px]">Importe</TableHead>
              <TableHead className="text-center min-w-[100px]">Estado</TableHead>
              <TableHead className="text-center min-w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Cargando datos...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : pagos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No se encontraron registros
                </TableCell>
              </TableRow>
            ) : (
              pagos.map((pago) => (
                <TableRow
                  key={pago.id}
                  className={exactIdFilter && pago.id.toString() === exactIdFilter ? "bg-amber-50" : ""}
                >
                  <TableCell>{pago.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{pago.docente_nombre}</div>
                    <div className="text-xs text-muted-foreground">Docente {pago.tipo_docente} {pago.periodo}</div>
                  </TableCell>
                  <TableCell className="" title={pago.curso_nombre}>{pago.curso_nombre}
                    <div className="text-xs text-muted-foreground" title={pago.programa_nombre + ' ' + pago.periodo}>{pago.programa_nombre} {pago.periodo}</div></TableCell>
                  <TableCell className='text-center' title={pago.numero_oficio_presentacion_facultad ? `${pago.numero_oficio_presentacion_facultad}` : 'Pendiente'}>
                    {pago.numero_oficio_presentacion_facultad ? `${pago.numero_oficio_presentacion_facultad}` : 'Pendiente'}
                    <div className="text-xs text-muted-foreground" title={pago.numero_oficio_presentacion_coordinador ? `N° ${pago.numero_oficio_presentacion_coordinador}` : 'Pendiente'}>Cord. Ofic.{' '}
                      {pago.numero_oficio_presentacion_coordinador ? `N° ${pago.numero_oficio_presentacion_coordinador}` : 'Pendiente'}</div>
                    <div className="text-xs text-muted-foreground" title={pago.numero_oficio_presentacion_direccion ? `N° ${pago.numero_oficio_presentacion_direccion}` : 'Pendiente'}>Ofic. Pres.{' '}
                      {pago.numero_oficio_presentacion_direccion ? `${pago.numero_oficio_presentacion_direccion}` : ''}</div>
                  </TableCell>
                  <TableCell className='text-center'>
                    {/* Si el docente es externo, que muestre la resolucion de aprobacion si es que hay, y si no hay, salga pendiente, pero si es docente interno, me salga no acto */}
                    {
                      pago.tipo_docente === 'externo' ? (
                        pago.numero_resolucion_aprobacion ? `RES N° ${pago.numero_resolucion_aprobacion}` : 'Pendiente'
                      ) : (
                        "-"
                      )
                    }
                  </TableCell>
                  <TableCell className='text-center'>
                    {pago.numero_oficio_conformidad_facultad ? `Of. ${pago.numero_oficio_conformidad_facultad}` : 'Pendiente'}
                    <div className="text-xs text-muted-foreground">Cord. Ofic.{' '}
                      {pago.numero_oficio_conformidad_coordinador ? `N° ${pago.numero_oficio_conformidad_coordinador}` : 'Pendiente'}</div>
                    <div className="text-xs text-muted-foreground">
                      {pago.numero_oficio_conformidad_direccion ? `${pago.numero_oficio_conformidad_direccion}` : 'Pendiente'}</div>
                  </TableCell>
                  <TableCell className='text-center'> Resol. Pago {' '}
                    {pago.numero_resolucion_pago ? `N° ${pago.numero_resolucion_pago}` : 'Pendiente'}
                    <div className="text-xs text-muted-foreground"> Ofic. {' '}
                      {pago.numero_oficio_contabilidad
                        ? `N° ${pago.numero_oficio_contabilidad}`
                        : 'Pendiente'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    S/. {Number(pago.importe_total || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-center">
                    {getEstadoBadge(pago.estado)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetail(pago.id)}>
                          <Eye className="mr-2 h-4 w-4" /> Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/pagos-docentes/${pago.id}/editar`)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setEstadoForm({ id: pago.id, estado: pago.estado, file: null });
                          setIsEstadoOpen(true);
                        }}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Cambiar estado
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(pago.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
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

      {/* Modal de Detalle */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Pago</DialogTitle>
            <DialogDescription>Información completa del expediente de pago</DialogDescription>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-muted-foreground animate-pulse">Cargando detalles...</span>
              </div>
            </div>
          ) : selectedPago ? (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Docente</h3>
                  <p>{selectedPago.docente?.titulo_profesional ? selectedPago.docente.titulo_profesional + ' ' : ''}{selectedPago.docente?.nombres} {selectedPago.docente?.apellido_paterno} {selectedPago.docente?.apellido_materno}</p>
                  <p className="text-sm text-muted-foreground">Docente {selectedPago.docente?.tipo_docente}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Estado</h3>
                  {getEstadoBadge(selectedPago.estado)}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Programa</h3>
                  <p>{selectedPago.programa_nombre}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Curso</h3>
                  <p>{selectedPago.curso?.nombre}</p>
                  <p className="text-sm text-muted-foreground">Código: {selectedPago.curso?.codigo}</p>
                </div>
              </div>

              {/* Fechas de Enseñanza */}


              {/* Detalles Financieros */}
              <div className="grid grid-cols-3 gap-5 border-b pb-5">
                {selectedPago.fechas_ensenanza && selectedPago.fechas_ensenanza.length > 0 && (
                  <div className="col-span-2">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">Fechas de Enseñanza</h3>
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">
                        📅 {formatearFechasLegibles(selectedPago.fechas_ensenanza)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="col-span-1">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Total</h3>
                  <p className="font-bold text-lg">S/ {selectedPago.importe_total}</p>
                </div>
              </div>

              {/* Documentos */}
              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Documentos Relacionados
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    {
                      label: "Pres. Facultad",
                      value: selectedPago.numero_oficio_presentacion_facultad,
                      show: true
                    },
                    {
                      label: "Pres. Coordinador",
                      value: selectedPago.numero_oficio_presentacion_coordinador,
                      show: true
                    },
                    {
                      label: "Pres. Dirección",
                      value: selectedPago.numero_oficio_presentacion_direccion,
                      show: true
                    },
                    {
                      label: "Resol. Aprobación",
                      value: selectedPago.numero_resolucion_aprobacion ? `RES N° ${selectedPago.numero_resolucion_aprobacion}` : null,
                      show: selectedPago.docente?.tipo_docente === 'externo',
                      canGenerate: selectedPago.estado === 'pendiente' && !(selectedPago.grado_nombre === 'Segunda Especialidad Profesional' && selectedPago.facultad_codigo === 'FE'),
                      generateAction: () => handleGenerateResolucionAceptacion(selectedPago.id),
                      isGenerating: isGeneratingResolucionAceptacion
                    },
                    {
                      label: "Conf. Facultad",
                      value: selectedPago.numero_oficio_conformidad_facultad,
                      show: true
                    },
                    {
                      label: "Conf. Coordinador",
                      value: selectedPago.numero_oficio_conformidad_coordinador,
                      show: true
                    },
                    {
                      label: "Resol. Pago",
                      value: selectedPago.numero_resolucion_pago,
                      show: true,
                      canGenerate: selectedPago.estado === 'proceso' && !(selectedPago.grado_nombre === 'Segunda Especialidad Profesional' && selectedPago.facultad_codigo !== 'FIQIA'),
                      generateAction: () => handleGenerateResolucion(selectedPago.id),
                      isGenerating: isGeneratingResolucion
                    },
                    {
                      label: "Oficio Contabilidad",
                      value: selectedPago.numero_oficio_contabilidad,
                      show: true,
                      canGenerate: selectedPago.estado === 'proceso' && selectedPago.grado_nombre !== 'Segunda Especialidad Profesional',
                      generateAction: () => handleGenerateOficio(selectedPago.id),
                      isGenerating: isGeneratingOficio
                    },
                    {
                      label: "Expediente Nota de Pago",
                      value: selectedPago.numero_expediente_nota_pago,
                      action: () => handleViewOficioPagoContabilidad(selectedPago.numero_expediente_nota_pago_url || ''),
                      show: true
                    }
                  ].map((doc, index) => {
                    // Si no tiene valor y no se puede generar, no mostrar (ocultar "Pendiente")
                    if (!doc.value && !doc.canGenerate) return null;
                    if (!doc.show) return null;

                    // Determinar si es clickeable (tiene valor y acción, o es generable)
                    const isClickable = (!!doc.value && (!!doc.generateAction || !!doc.action));

                    const handleClick = () => {
                      if (doc.value) {
                        if (doc.generateAction) doc.generateAction();
                        else if (doc.action) doc.action();
                      }
                    };

                    return (
                      <div
                        key={index}
                        className={`flex flex-col p-2 rounded-md border transition-colors ${isClickable
                          ? "bg-primary/10 border-primary/20 hover:bg-primary/20 cursor-pointer"
                          : "bg-muted/30"
                          }`}
                        onClick={isClickable ? handleClick : undefined}
                      >
                        <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">
                          {doc.label}
                        </span>
                        <div className="min-h-[20px] flex items-center">
                          {doc.value ? (
                            <span className="text-sm font-medium truncate flex items-center gap-1" title={doc.value}>
                              {doc.value}
                              {isClickable && (
                                doc.isGenerating ? (
                                  <Loader2 className="h-3 w-3 animate-spin text-primary ml-1" />
                                ) : (
                                  <span className="text-[10px] text-primary ml-1">(Abrir)</span>
                                )
                              )}
                            </span>
                          ) : doc.canGenerate ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs w-full mt-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (doc.generateAction) doc.generateAction();
                              }}
                              disabled={doc.isGenerating}
                            >
                              {doc.isGenerating ? (
                                <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Generando...</>
                              ) : (
                                <><FileText className="mr-1 h-3 w-3" /> Generar</>
                              )}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No se pudo cargar la información
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Cambio de Estado - Premium Design */}
      <Dialog open={isEstadoOpen} onOpenChange={setIsEstadoOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Pago</DialogTitle>
            <DialogDescription className="text-sm">
              Seleccione el nuevo estado para este pago docente. Al marcarlo como <strong>Completado</strong>, deberá adjuntar el documento de sustento final.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <label htmlFor="estado" className="text-sm font-semibold text-gray-700">
                Nuevo Estado
              </label>
              <select
                id="estado"
                value={estadoForm.estado}
                onChange={(e) => setEstadoForm({ ...estadoForm, estado: e.target.value })}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>

            {estadoForm.estado === 'completado' && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Documento de Sustento (Opcional)
                </label>

                {!estadoForm.file ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500', 'bg-blue-50'); }}
                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50'); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                      const file = e.dataTransfer.files?.[0];
                      if (file) setEstadoForm({ ...estadoForm, file });
                    }}
                    onClick={() => document.getElementById('file-upload-pago')?.click()}
                    className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Haz clic o arrastra un archivo</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOCX o Imágenes (máx. 10MB)</p>
                    </div>
                    <input
                      id="file-upload-pago"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setEstadoForm({ ...estadoForm, file: e.target.files?.[0] || null })}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                      <FileIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-900 truncate">{estadoForm.file.name}</p>
                      <p className="text-xs text-blue-600">{(estadoForm.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEstadoForm({ ...estadoForm, file: null })}
                      className="text-blue-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <p className="text-[11px] text-gray-500 flex items-start gap-1.5 px-1">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                  El archivo se subirá automáticamente a Google Drive y se vinculará al pago.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => { setIsEstadoOpen(false); setEstadoForm({ ...estadoForm, file: null }); }}
              disabled={loadingEstado}
              className="px-6 rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEstado}
              disabled={loadingEstado}
              className="px-6 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"
            >
              {loadingEstado ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Actualizar Estado
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
