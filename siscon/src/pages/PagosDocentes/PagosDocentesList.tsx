import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Clipboard,
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
  numero_oficio_presentacion_facultad?: string;
  numero_oficio_presentacion_coordinador?: string;
  numero_oficio_conformidad_facultad?: string;
  numero_oficio_conformidad_coordinador?: string;
  numero_oficio_conformidad_direccion?: string;
  numero_resolucion_aprobacion?: string;
  fecha_resolucion_aprobacion?: string;
  numero_resolucion_pago?: string;
  numero_oficio_contabilidad?: string;
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

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>;
      case 'en_proceso':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">En Proceso</Badge>;
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
          placeholder="Periodo (ej. 2024-I)"
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
              <TableHead>ID</TableHead>
              <TableHead className="text-center">Docente</TableHead>
              <TableHead className="text-center">Curso</TableHead>
              <TableHead className="text-center">Presentación</TableHead>
              <TableHead className="text-center">Aprobación</TableHead>
              <TableHead className="text-center">Conformidad</TableHead>
              <TableHead className="text-center">Documentos Generados</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Cargando datos...
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
                <TableRow key={pago.id}>
                  <TableCell>{pago.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{pago.docente_nombre}</div>
                    <div className="text-xs text-muted-foreground">Docente {pago.tipo_docente}</div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={pago.curso_nombre}>{pago.curso_nombre}
                    <div className="text-xs text-muted-foreground" title={pago.programa_nombre + ' ' + pago.periodo}>{pago.programa_nombre} {pago.periodo}</div></TableCell>
                  <TableCell className='text-center' title={pago.numero_oficio_presentacion_facultad ? `${pago.numero_oficio_presentacion_facultad}` : 'Pendiente'}>
                    {pago.numero_oficio_presentacion_facultad ? `${pago.numero_oficio_presentacion_facultad}` : 'Pendiente'}
                    <div className="text-xs text-muted-foreground" title={pago.numero_oficio_presentacion_coordinador ? `N° ${pago.numero_oficio_presentacion_coordinador}` : 'Pendiente'}>Cord. Ofic.{' '}
                      {pago.numero_oficio_presentacion_coordinador ? `N° ${pago.numero_oficio_presentacion_coordinador}` : 'Pendiente'}</div>
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
                    {pago.numero_oficio_conformidad_facultad ? `${pago.numero_oficio_conformidad_facultad}` : 'Pendiente'}
                    <div className="text-xs text-muted-foreground">Cord. Ofic.{' '}
                      {pago.numero_oficio_conformidad_coordinador ? `N° ${pago.numero_oficio_conformidad_coordinador}` : 'Pendiente'}</div>
                    <div className="text-xs text-muted-foreground">Dir. Ofic.{' '}
                      {pago.numero_oficio_conformidad_direccion ? `N° ${pago.numero_oficio_conformidad_direccion}` : 'Pendiente'}</div>
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
                    S/ {Number(pago.importe_total || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getEstadoBadge(pago.estado)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetail(pago.id)} title="Ver detalle">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {pago.tipo_docente === 'externo' && pago.estado === 'pendiente' ? (
                        /* CASO 1: Externo y Pendiente -> Solo Resolución de Aprobación */
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleGenerateResolucionAceptacion(pago.id)}
                          disabled={isGeneratingResolucionAceptacion}
                          title="Generar Resolución de Aprobación"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          {isGeneratingResolucionAceptacion ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </Button>
                      ) : pago.estado === 'proceso' ? (
                        /* CASO 2: En proceso (Sea interno o externo) -> Resolución de Pago y Oficio */
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGenerateResolucion(pago.id)}
                            disabled={isGeneratingResolucion}
                            title="Generar Resolución de Pago"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            {isGeneratingResolucion ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGenerateOficio(pago.id)}
                            disabled={isGeneratingOficio}
                            title="Generar Oficio de Contabilidad"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            {isGeneratingOficio ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Clipboard className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      ) : null}
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/pagos-docentes/${pago.id}/editar`)} title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(pago.id)} title="Eliminar">
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
                    { label: "Pres. Facultad", value: selectedPago.numero_oficio_presentacion_facultad },
                    { label: "Pres. Coordinador", value: selectedPago.numero_oficio_presentacion_coordinador },
                    { label: "Resol. Aprobación", value: selectedPago.numero_resolucion_aprobacion ? `RES N° ${selectedPago.numero_resolucion_aprobacion}` : null },
                    { label: "Conf. Facultad", value: selectedPago.numero_oficio_conformidad_facultad },
                    { label: "Conf. Coordinador", value: selectedPago.numero_oficio_conformidad_coordinador },
                    { label: "Resol. Pago", value: selectedPago.numero_resolucion_pago },
                    { label: "Oficio Contabilidad", value: selectedPago.numero_oficio_contabilidad },
                  ].map((doc, index) =>
                    doc.value && (
                      <div
                        key={index}
                        className="flex flex-col p-2 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">
                          {doc.label}
                        </span>
                        <span className="text-sm font-medium truncate" title={doc.value}>
                          {doc.value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Generar Documentos */}

              {/* Solo renderiza la sección completa si hay algo que mostrar */}
              {selectedPago && (
                // Condición lógica: 
                // 1. Si es interno y pendiente (Muestra Res. Aprobación)
                // 2. O si el estado es 'proceso' (Muestra los otros dos botones)
                ((selectedPago.estado === 'pendiente' && selectedPago.docente?.tipo_docente === 'externo') ||
                  selectedPago.estado === 'proceso') && (

                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-3">Generar Documentos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                      {/* CASO: EXTERNO + PENDIENTE */}
                      {selectedPago.estado === 'pendiente' && selectedPago.docente?.tipo_docente === 'externo' && (
                        <Button
                          onClick={() => handleGenerateResolucionAceptacion(selectedPago.id)}
                          disabled={isGeneratingResolucionAceptacion}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {isGeneratingResolucionAceptacion ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...</>
                          ) : (
                            <><FileText className="mr-2 h-4 w-4" /> Generar Resolución de Aprobación</>
                          )}
                        </Button>
                      )}

                      {/* CASO: ESTADO EN PROCESO */}
                      {selectedPago.estado === 'proceso' && (
                        <>
                          <Button
                            onClick={() => handleGenerateResolucion(selectedPago.id)}
                            disabled={isGeneratingResolucion}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            {isGeneratingResolucion ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...</>
                            ) : (
                              <><FileText className="mr-2 h-4 w-4" /> Generar Resolución de Pago</>
                            )}
                          </Button>

                          <Button
                            onClick={() => handleGenerateOficio(selectedPago.id)}
                            disabled={isGeneratingOficio}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {isGeneratingOficio ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...</>
                            ) : (
                              <><Clipboard className="mr-2 h-4 w-4" /> Generar Oficio de Contabilidad</>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              )}



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
