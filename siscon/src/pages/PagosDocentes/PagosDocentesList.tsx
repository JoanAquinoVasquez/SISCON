import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Loader2
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
    const date = new Date(year, month - 1, day);
    const mes = date.getMonth();
    const anio = date.getFullYear();
    const dia = date.getDate();
    const key = `${mes}-${anio}`;

    if (!fechasPorMesAnio[key]) {
      fechasPorMesAnio[key] = [];
    }
    fechasPorMesAnio[key].push(dia);
  });

  // Construir el texto formateado
  const grupos = Object.entries(fechasPorMesAnio).map(([key, dias]) => {
    const [mes, anio] = key.split('-').map(Number);
    dias.sort((a, b) => a - b);

    // Formatear los días con "y" antes del último
    let diasTexto = '';
    if (dias.length === 1) {
      diasTexto = dias[0].toString();
    } else if (dias.length === 2) {
      diasTexto = `${dias[0]} y ${dias[1]}`;
    } else {
      const ultimos = dias.slice(-1)[0];
      const anteriores = dias.slice(0, -1).join(', ');
      diasTexto = `${anteriores} y ${ultimos}`;
    }

    return { diasTexto, mes: meses[mes], anio };
  });

  // Si todas las fechas son del mismo año
  const anioUnico = grupos.every(g => g.anio === grupos[0].anio) ? grupos[0].anio : null;

  if (grupos.length === 1) {
    return `${grupos[0].diasTexto} de ${grupos[0].mes} de ${grupos[0].anio}`;
  } else {
    const partes = grupos.map((g, i) => {
      if (i === grupos.length - 1 && anioUnico) {
        return `${g.diasTexto} de ${g.mes} de ${anioUnico}`;
      }
      return `${g.diasTexto} de ${g.mes}`;
    });
    return partes.join(' y ');
  }
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
  docente?: {
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    dni: string;
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
  const [pagos, setPagos] = useState<PagoDocente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    periodo: '',
    tipo_docente: '',
    programa_id: ''
  });
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [page, setPage] = useState(1);

  // Modal de detalle
  const [selectedPago, setSelectedPago] = useState<PagoDocente | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchPagos = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        search,
        ...filters
      };

      const response = await axios.get('/pagos-docentes', { params });
      setPagos(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to
      });
    } catch (error) {
      console.error('Error al cargar pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, [page, search, filters]);

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      try {
        await axios.delete(`/pagos-docentes/${id}`);
        fetchPagos();
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el registro');
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
      alert('Error al cargar los detalles del pago');
      setIsDetailOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>;
      case 'procesando':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Procesando</Badge>;
      case 'observado':
        return <Badge variant="destructive">Observado</Badge>;
      case 'finalizado':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Finalizado</Badge>;
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
        <Button onClick={() => navigate('/pagos-docentes/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Pago
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por docente, DNI o curso..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Input
          placeholder="Periodo (ej. 2024-1)"
          className="w-full md:w-40"
          value={filters.periodo}
          onChange={(e) => setFilters({ ...filters, periodo: e.target.value })}
        />
        <Select
          value={filters.tipo_docente}
          onValueChange={(value) => setFilters({ ...filters, tipo_docente: value })}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Tipo Docente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="interno">Interno</SelectItem>
            <SelectItem value="externo">Externo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Docente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Programa</TableHead>
              <TableHead>Periodo</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Cargando datos...
                  </div>
                </TableCell>
              </TableRow>
            ) : pagos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No se encontraron registros
                </TableCell>
              </TableRow>
            ) : (
              pagos.map((pago) => (
                <TableRow key={pago.id}>
                  <TableCell>
                    <div className="font-medium">{pago.docente_nombre}</div>
                    <div className="text-xs text-muted-foreground">{pago.docente_dni}</div>
                  </TableCell>
                  <TableCell className="capitalize">{pago.tipo_docente}</TableCell>
                  <TableCell>{pago.curso_nombre}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={pago.programa_nombre}>
                    {pago.programa_nombre}
                  </TableCell>
                  <TableCell>{pago.periodo}</TableCell>
                  <TableCell className="text-right font-medium">
                    S/ {Number(pago.importe_total || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getEstadoBadge(pago.estado)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetail(pago.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/pagos-docentes/${pago.id}/editar`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(pago.id)}>
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
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : selectedPago ? (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Docente</h3>
                  <p>{selectedPago.docente?.nombres} {selectedPago.docente?.apellido_paterno} {selectedPago.docente?.apellido_materno}</p>
                  <p className="text-sm text-muted-foreground">DNI: {selectedPago.docente?.dni}</p>
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
              {selectedPago.fechas_ensenanza && selectedPago.fechas_ensenanza.length > 0 && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Fechas de Enseñanza</h3>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      📅 {formatearFechasLegibles(selectedPago.fechas_ensenanza)}
                    </p>
                  </div>
                </div>
              )}

              {/* Detalles Financieros */}
              <div className="grid grid-cols-3 gap-4 border-b pb-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Horas</h3>
                  <p>{selectedPago.numero_horas}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Costo/Hora</h3>
                  <p>S/ {selectedPago.costo_por_hora}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Total</h3>
                  <p className="font-bold text-lg">S/ {selectedPago.importe_total}</p>
                </div>
                <div className="col-span-3">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Importe en Letras</h3>
                  <p className="italic">{selectedPago.importe_letras}</p>
                </div>
              </div>

              {/* Documentos */}
              <div>
                <h3 className="font-semibold mb-3">Documentos Adjuntos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPago.numero_informe_final_url && (
                    <a href={selectedPago.numero_informe_final_url} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 border rounded hover:bg-slate-50">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm truncate">Informe Final ({selectedPago.numero_informe_final})</span>
                    </a>
                  )}
                  {selectedPago.numero_recibo_honorario_url && (
                    <a href={selectedPago.numero_recibo_honorario_url} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 border rounded hover:bg-slate-50">
                      <FileText className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm truncate">Recibo Honorarios ({selectedPago.numero_recibo_honorario})</span>
                    </a>
                  )}
                  {/* Si no hay documentos */}
                  {!selectedPago.numero_informe_final_url && !selectedPago.numero_recibo_honorario_url && (
                    <p className="text-sm text-muted-foreground italic">No hay documentos adjuntos</p>
                  )}
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
    </div>
  );
}
