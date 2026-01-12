import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SelectConBusqueda } from '../../components/ui/select-con-busqueda';
import { CalendarioMultiple } from '../../components/ui/calendario-multiple';
import { FileUpload } from '../../components/ui/file-upload';
import { Tabs, TabPanel } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { useNumeroALetras } from '../../hooks/useNumeroALetras';
import axios from '../../lib/axios';
import { useToast } from '@/context/ToastContext';

interface Docente {
  id: number;
  label: string;
  tipo_docente: 'interno' | 'externo';
}

interface Curso {
  id: number | string;
  label: string;
  periodo: string;
  programa_id: number;
}

interface DatosCurso {
  programa_id: number;
  programa_nombre: string;
  periodo: string;
  facultad_nombre: string | null;
  director_nombre: string | null;
  coordinador_nombre: string | null;
}

// Componente DocumentField fuera del componente principal para evitar pérdida de foco
const DocumentField = ({ label, value, onChange, urlValue, onUrlChange, placeholder, showUpload = false }: any) => (
  <div className="space-y-3">
    <div className={showUpload ? "grid grid-cols-2 gap-3" : ""}>
      <div>
        <Label className="text-sm">{label}</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9"
          placeholder={placeholder}
        />
      </div>
      {showUpload && (
        <FileUpload
          label="PDF"
          value={urlValue}
          onChange={onUrlChange}
        />
      )}
    </div>
  </div>
);

// Helper function to format dates for input[type="date"]
const formatDateForInput = (dateValue: any): string => {
  if (!dateValue) return '';

  // If it's already in YYYY-MM-DD format, return as is
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  // If it's an ISO string with time (e.g., "2025-12-24T00:00:00.000000Z")
  // Extract just the date part to avoid timezone issues
  if (typeof dateValue === 'string' && dateValue.includes('T')) {
    const datePart = dateValue.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return datePart;
    }
  }

  // For any other format, try to parse it
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';

    // Use UTC methods to avoid timezone offset issues
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

export default function PagoDocenteForm() {
  const { id } = useParams();
  const { showToast } = useToast();

  const navigate = useNavigate();
  const { numeroALetras } = useNumeroALetras();
  const [activeTab, setActiveTab] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Estados principales
  const [docente, setDocente] = useState<Docente | null>(null);
  const [curso, setCurso] = useState<Curso | null>(null);
  const [periodo, setPeriodo] = useState<string>('');
  const [datosCurso, setDatosCurso] = useState<DatosCurso>({
    programa_id: 0,
    programa_nombre: '',
    periodo: '',
    facultad_nombre: null,
    director_nombre: null,
    coordinador_nombre: null,
  });

  // Cálculos
  const [numeroHoras, setNumeroHoras] = useState<string>('');
  const [costoPorHora, setCostoPorHora] = useState<string>('');
  const [importeTotal, setImporteTotal] = useState<number>(0);
  const [importeLetras, setImporteLetras] = useState<string>('');

  // Fechas
  const [fechasEnsenanza, setFechasEnsenanza] = useState<string[]>([]);

  // Documentos comunes
  const [numeroInformeFinal, setNumeroInformeFinal] = useState('');
  const [numeroInformeFinalUrl, setNumeroInformeFinalUrl] = useState('');

  // Doc Recibido
  const [numeroOficioPagoDireccion, setNumeroOficioPagoDireccion] = useState('');
  const [numeroOficioPagoDireccionUrl, setNumeroOficioPagoDireccionUrl] = useState('');
  const [pedidoServicio, setPedidoServicio] = useState('');
  const [ordenServicio, setOrdenServicio] = useState('');
  const [actaConformidad, setActaConformidad] = useState('');
  const [numeroExpSiaf, setNumeroExpSiaf] = useState('');
  const [notaPago, setNotaPago] = useState('');
  const [notaPago2, setNotaPago2] = useState('');
  const [fechaPago, setFechaPago] = useState('');
  const [fechaNotaPago, setFechaNotaPago] = useState('');
  const [fechaNotaPago2, setFechaNotaPago2] = useState('');

  // Documentos internos
  const [docInterno, setDocInterno] = useState({
    numero_oficio_presentacion_facultad: '',
    numero_oficio_presentacion_facultad_url: '',
    numero_oficio_presentacion_coordinador: '',
    numero_oficio_presentacion_coordinador_url: '',
    numero_oficio_conformidad_facultad: '',
    numero_oficio_conformidad_facultad_url: '',
    numero_oficio_conformidad_coordinador: '',
    numero_oficio_conformidad_coordinador_url: '',
    numero_oficio_conformidad_direccion: '',
    numero_oficio_conformidad_direccion_url: '',
    numero_resolucion_aprobacion: '',
    fecha_resolucion_aprobacion: '',
    numero_resolucion_pago: '',
    numero_resolucion_url: '',
    fecha_resolucion: '',
    numero_oficio_contabilidad: '',
    numero_oficio_contabilidad_url: '',
    fecha_oficio_contabilidad: '',
  });

  // Documentos externos
  const [docExterno, setDocExterno] = useState({
    // Campos específicos de externos
    tiene_retencion_8_porciento: false,
    numero_recibo_honorario: '',
    numero_recibo_honorario_url: '',
    fecha_recibo_honorario: '',
    numero_pedido_servicio_url: '',
    // Campos comunes con internos
    numero_oficio_presentacion_facultad: '',
    numero_oficio_presentacion_facultad_url: '',
    numero_oficio_presentacion_coordinador: '',
    numero_oficio_presentacion_coordinador_url: '',
    numero_oficio_conformidad_facultad: '',
    numero_oficio_conformidad_facultad_url: '',
    numero_oficio_conformidad_coordinador: '',
    numero_oficio_conformidad_coordinador_url: '',
    numero_oficio_conformidad_direccion: '',
    numero_oficio_conformidad_direccion_url: '',
    numero_resolucion_aprobacion: '',
    fecha_resolucion_aprobacion: '',
    numero_resolucion_pago: '',
    numero_resolucion_url: '',
    fecha_resolucion: '',
    numero_oficio_contabilidad: '',
    numero_oficio_contabilidad_url: '',
    fecha_oficio_contabilidad: '',
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (id) {
      const fetchPago = async () => {
        try {
          setLoadingData(true);
          const response = await axios.get(`/pagos-docentes/${id}`);
          const data = response.data.data;

          // Verificar que existan las relaciones
          if (!data.docente) {
            console.error('Datos de docente no encontrados');
            showToast('Error: Datos de docente no encontrados', 'error');
            navigate('/pagos-docentes');
            return;
          }

          if (!data.curso) {
            console.error('Datos de curso no encontrados');
            showToast('Error: Datos de curso no encontrados', 'error');
            navigate('/pagos-docentes');
            return;
          }

          // Poblar estados
          setDocente({
            id: data.docente_id,
            label: (data.docente.titulo_profesional ? data.docente.titulo_profesional + ' ' : '') +
              `${data.docente.nombres} ${data.docente.apellido_paterno} ${data.docente.apellido_materno}`,
            tipo_docente: data.docente.tipo_docente
          });

          // Encontrar el semestre que coincide con el periodo para construir el ID compuesto
          const matchingSemestre = data.curso.semestres?.find((s: any) => s.programa?.periodo === data.periodo);
          const compositeId = matchingSemestre ? `${data.curso_id}-${matchingSemestre.id}` : data.curso_id;

          setCurso({
            id: compositeId,
            label: `${data.curso.nombre}`,
            periodo: data.periodo,
            programa_id: 0 // No longer needed
          });

          setPeriodo(data.periodo);
          setNumeroHoras(data.numero_horas.toString());
          setCostoPorHora(data.costo_por_hora.toString());
          setImporteTotal(parseFloat(data.importe_total) || 0);
          setImporteLetras(data.importe_letras);
          setFechasEnsenanza(data.fechas_ensenanza || []);
          setNumeroInformeFinal(data.numero_informe_final || '');
          setNumeroInformeFinalUrl(data.numero_informe_final_url || '');
          setNumeroOficioPagoDireccion(data.numero_oficio_pago_direccion || '');
          setNumeroOficioPagoDireccionUrl(data.numero_oficio_pago_direccion_url || '');
          setPedidoServicio(data.numero_pedido_servicio || '');
          setOrdenServicio(data.orden_servicio || '');
          setActaConformidad(data.acta_conformidad || '');
          setNumeroExpSiaf(data.numero_exp_siaf || '');
          setNumeroExpSiaf(data.numero_exp_siaf || '');
          setNotaPago(data.nota_pago || '');
          setNotaPago2(data.nota_pago_2 || '');
          setFechaPago(formatDateForInput(data.fecha_pago));
          setFechaNotaPago(formatDateForInput(data.fecha_nota_pago));
          setFechaNotaPago2(formatDateForInput(data.fecha_nota_pago_2));

          // Siempre poblar documentos internos (disponibles para todos los tipos)
          setDocInterno({
            numero_oficio_presentacion_facultad: data.numero_oficio_presentacion_facultad || '',
            numero_oficio_presentacion_facultad_url: data.numero_oficio_presentacion_facultad_url || '',
            numero_oficio_presentacion_coordinador: data.numero_oficio_presentacion_coordinador || '',
            numero_oficio_presentacion_coordinador_url: data.numero_oficio_presentacion_coordinador_url || '',
            numero_oficio_conformidad_facultad: data.numero_oficio_conformidad_facultad || '',
            numero_oficio_conformidad_facultad_url: data.numero_oficio_conformidad_facultad_url || '',
            numero_oficio_conformidad_coordinador: data.numero_oficio_conformidad_coordinador || '',
            numero_oficio_conformidad_coordinador_url: data.numero_oficio_conformidad_coordinador_url || '',
            numero_oficio_conformidad_direccion: data.numero_oficio_conformidad_direccion || '',
            numero_oficio_conformidad_direccion_url: data.numero_oficio_conformidad_direccion_url || '',
            numero_resolucion_aprobacion: data.numero_resolucion_aprobacion || '',
            fecha_resolucion_aprobacion: formatDateForInput(data.fecha_resolucion_aprobacion),
            numero_resolucion_pago: data.numero_resolucion_pago || '',
            numero_resolucion_url: data.numero_resolucion_url || '',
            fecha_resolucion: formatDateForInput(data.fecha_resolucion),
            numero_oficio_contabilidad: data.numero_oficio_contabilidad || '',
            numero_oficio_contabilidad_url: data.numero_oficio_contabilidad_url || '',
            fecha_oficio_contabilidad: formatDateForInput(data.fecha_oficio_contabilidad),
          });

          // Poblar documentos externos solo si es externo
          if (data.docente.tipo_docente === 'externo') {
            setDocExterno({
              tiene_retencion_8_porciento: data.tiene_retencion_8_porciento || false,
              numero_recibo_honorario: data.numero_recibo_honorario || '',
              numero_recibo_honorario_url: data.numero_recibo_honorario_url || '',
              fecha_recibo_honorario: formatDateForInput(data.fecha_recibo_honorario),
              numero_pedido_servicio_url: data.numero_pedido_servicio_url || '',
              // Campos comunes (ya están en docInterno, pero los mantenemos aquí para consistencia)
              numero_oficio_presentacion_facultad: data.numero_oficio_presentacion_facultad || '',
              numero_oficio_presentacion_facultad_url: data.numero_oficio_presentacion_facultad_url || '',
              numero_oficio_presentacion_coordinador: data.numero_oficio_presentacion_coordinador || '',
              numero_oficio_presentacion_coordinador_url: data.numero_oficio_presentacion_coordinador_url || '',
              numero_oficio_conformidad_facultad: data.numero_oficio_conformidad_facultad || '',
              numero_oficio_conformidad_facultad_url: data.numero_oficio_conformidad_facultad_url || '',
              numero_oficio_conformidad_coordinador: data.numero_oficio_conformidad_coordinador || '',
              numero_oficio_conformidad_coordinador_url: data.numero_oficio_conformidad_coordinador_url || '',
              numero_oficio_conformidad_direccion: data.numero_oficio_conformidad_direccion || '',
              numero_oficio_conformidad_direccion_url: data.numero_oficio_conformidad_direccion_url || '',
              numero_resolucion_aprobacion: data.numero_resolucion_aprobacion || '',
              fecha_resolucion_aprobacion: formatDateForInput(data.fecha_resolucion_aprobacion),
              numero_resolucion_pago: data.numero_resolucion_pago || '',
              numero_resolucion_url: data.numero_resolucion_url || '',
              fecha_resolucion: formatDateForInput(data.fecha_resolucion),
              numero_oficio_contabilidad: data.numero_oficio_contabilidad || '',
              numero_oficio_contabilidad_url: data.numero_oficio_contabilidad_url || '',
              fecha_oficio_contabilidad: formatDateForInput(data.fecha_oficio_contabilidad),
            });
          }


          // Fetch fresh course data immediately to avoid flash of old content
          try {
            const courseResponse = await axios.get(`/pagos-docentes/curso/${compositeId}/datos`);
            setDatosCurso(courseResponse.data.data);
            // Ensure period is consistent
            if (courseResponse.data.data.periodo) {
              setPeriodo(courseResponse.data.data.periodo);
            }
          } catch (error) {
            console.error('Error fetching fresh course data:', error);
            // Fallback to stored data if fetch fails
            setDatosCurso({
              programa_id: 0,
              programa_nombre: data.programa_nombre || '',
              periodo: data.periodo,
              facultad_nombre: data.facultad_nombre,
              director_nombre: data.director_nombre,
              coordinador_nombre: data.coordinador_nombre,
            });
          }

        } catch (error) {
          console.error('Error al cargar pago:', error);
          showToast('Error al cargar los datos del pago', 'error');
          navigate('/pagos-docentes');
        } finally {
          setLoadingData(false);
        }
      };
      fetchPago();
    }
  }, [id]);

  // Calcular importe automáticamente
  useEffect(() => {
    const horas = parseFloat(numeroHoras) || 0;
    const costo = parseFloat(costoPorHora) || 0;
    const total = horas * costo;
    setImporteTotal(total);
    setImporteLetras(total > 0 ? numeroALetras(total) : '');
  }, [numeroHoras, costoPorHora, numeroALetras]);

  // Cargar datos del curso cuando se selecciona
  useEffect(() => {
    if (curso) {
      // Si es un nuevo registro (!id) SIEMPRE cargar datos
      // Si es edición (id), SOLO cargar si el curso seleccionado es diferente al que vino de la BD
      // Para simplificar: Si el usuario selecciona un curso en el combobox, queremos actualizar los datos
      // El problema es que al cargar la página, setCurso dispara este efecto.

      const fetchDatosCurso = async () => {
        try {
          const response = await axios.get(`/pagos-docentes/curso/${curso.id}/datos`);
          setDatosCurso(response.data.data);
          setPeriodo(response.data.data.periodo);
        } catch (error) {
          console.error('Error al cargar datos del curso:', error);
        }
      };

      // Si estamos editando y acabamos de cargar los datos (loadingData es true o acabamos de setear el curso inicial),
      // tal vez no queramos sobrescribir.
      // Pero si el usuario CAMBIA el curso, sí.
      // Una forma es comparar el ID del curso con el que teníamos guardado.

      // Solución pragmática: Si datosCurso.programa_nombre está vacío (caso nuevo) O
      // si el usuario interactuó (podríamos usar un flag, pero por ahora...)
      // Vamos a permitir la recarga si el ID del curso no coincide con el que teníamos en datosCurso (si tuviéramos ese dato guardado aparte)
      // O simplemente permitirlo siempre que no sea la carga inicial.

      fetchDatosCurso();
    }
  }, [curso]); // Removemos 'id' de la dependencia para que corra siempre que cambie curso

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields = [];
    if (!docente) missingFields.push('Docente');
    if (!curso) missingFields.push('Curso');
    if (!periodo) missingFields.push('Periodo');
    if (fechasEnsenanza.length === 0) missingFields.push('Fechas de Enseñanza');

    if (missingFields.length > 0) {
      showToast(`Por favor complete: ${missingFields.join(', ')}`, 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        docente_id: docente?.id,
        curso_id: typeof curso?.id === 'string' && curso?.id.includes('-')
          ? curso?.id.split('-')[0]
          : curso?.id,
        periodo: periodo || '', // Ensure empty string is sent if null/undefined
        facultad_nombre: datosCurso.facultad_nombre,
        director_nombre: datosCurso.director_nombre,
        coordinador_nombre: datosCurso.coordinador_nombre,
        numero_horas: parseFloat(numeroHoras),
        costo_por_hora: parseFloat(costoPorHora),
        importe_total: importeTotal,
        importe_letras: importeLetras,
        fechas_ensenanza: fechasEnsenanza,
        numero_informe_final: numeroInformeFinal,
        numero_informe_final_url: numeroInformeFinalUrl,
        numero_oficio_pago_direccion: numeroOficioPagoDireccion,
        numero_oficio_pago_direccion_url: numeroOficioPagoDireccionUrl,
        numero_pedido_servicio: pedidoServicio,
        orden_servicio: ordenServicio,
        acta_conformidad: actaConformidad,
        numero_exp_siaf: numeroExpSiaf,
        nota_pago: notaPago,
        nota_pago_2: notaPago2,
        fecha_pago: fechaPago,
        fecha_nota_pago: fechaNotaPago,
        fecha_nota_pago_2: fechaNotaPago2,
        ...(docente?.tipo_docente === 'interno' ? {
          ...docInterno,
          numero_resolucion_pago: docInterno.numero_resolucion_pago,
          numero_resolucion_aprobacion: docInterno.numero_resolucion_aprobacion,
          fecha_resolucion_aprobacion: docInterno.fecha_resolucion_aprobacion
        } : {}),
        ...(docente?.tipo_docente === 'externo' ? {
          ...docExterno,
          numero_resolucion_pago: docExterno.numero_resolucion_pago,
          numero_resolucion_aprobacion: docExterno.numero_resolucion_aprobacion,
          fecha_resolucion_aprobacion: docExterno.fecha_resolucion_aprobacion,
        } : {}),
      };

      console.log('Enviando payload:', payload);

      if (id) {
        await axios.put(`/pagos-docentes/${id}`, payload);
        showToast('Pago actualizado exitosamente', 'success');
      } else {
        await axios.post('/pagos-docentes', payload);
        showToast('Pago registrado exitosamente', 'success');
      }
      navigate('/pagos-docentes');
    } catch (error) {
      console.error('Error al guardar:', error);
      showToast('Error al guardar el pago', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear tab al cambiar tipo de docente para evitar estados inconsistentes
  useEffect(() => {
    setActiveTab('general');
  }, [docente?.tipo_docente]);


  const getTabs = () => {
    const baseTabs = [
      { id: 'general', label: 'Información General', icon: '📋' },
      { id: 'calculos', label: 'Cálculos', icon: '💰' },
      { id: 'documentos', label: 'Presentación', icon: '📄' },
      { id: 'documentos-internos', label: 'Conformidad', icon: '📑' },
      { id: 'doc-recibido', label: 'Doc Recibido', icon: '📬' }
    ];

    return baseTabs;
  };

  const tabs = getTabs();

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {id ? 'Editar Pago Docente' : 'Registro de Pago Docente'}
        </h1>
        <p className="text-gray-600 mt-1">
          {id ? 'Modifique la información del pago' : 'Complete la información del pago'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 shadow-lg">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <TabPanel id="general" activeTab={activeTab}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Docente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Docente</h3>
                <SelectConBusqueda
                  label="Docente *"
                  searchEndpoint="/pagos-docentes/buscar-docente"
                  value={docente}
                  onChange={(option) => setDocente(option as Docente | null)}
                  placeholder="Buscar por nombre o DNI..."
                />
                <div>
                  <Label>Condición</Label>
                  <Input
                    value={docente?.tipo_docente || ''}
                    disabled
                    className="capitalize bg-gray-50"
                  />
                </div>
              </div>

              {/* Curso */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Curso y Programa</h3>
                <SelectConBusqueda
                  label="Curso *"
                  searchEndpoint="/pagos-docentes/buscar-curso"
                  value={curso}
                  onChange={(option) => {
                    const newCurso = option as Curso | null;
                    setCurso(newCurso);
                    if (newCurso && newCurso.periodo) {
                      setPeriodo(newCurso.periodo);
                    }
                  }}
                  placeholder="Buscar por código o nombre..."
                />
                <div>
                  <Label>Programa</Label>
                  <Input title={`${datosCurso.programa_nombre || ''}`} value={datosCurso.programa_nombre || ''} disabled className="bg-gray-50" />
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel id="calculos" activeTab={activeTab}>
            <div className="max-w-4xl mx-auto space-y-4">

              {/* Contenedor Compacto de Fechas */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Fechas de Enseñanza <span className="text-red-500">*</span>
                  </h3>
                  <span className="text-xs text-slate-400 bg-white px-2 py-1 rounded border">
                    {fechasEnsenanza.length} días seleccionados
                  </span>
                </div>

                <CalendarioMultiple
                  label=""
                  selectedDates={fechasEnsenanza}
                  onChange={setFechasEnsenanza}
                  highlightWeekends={true}
                />

              </div>

              {/* Fila de Cálculos Comprimida */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">N° de Horas</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={numeroHoras}
                    onChange={(e) => setNumeroHoras(e.target.value)}
                    placeholder="0.00"
                    className="h-9 focus-visible:ring-blue-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Costo por Hora</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">S/.</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={costoPorHora}
                      onChange={(e) => setCostoPorHora(e.target.value)}
                      placeholder="0.00"
                      className="h-9 pl-7 focus-visible:ring-blue-400"
                    />
                  </div>
                </div>

                {/* Importe Total ocupando 2 columnas para balancear */}
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold text-blue-700">Importe Total Calculado</Label>
                  <div className="flex items-center h-9 px-4 rounded-md bg-blue-600 text-white font-bold shadow-sm">
                    <span className="text-sm mr-auto text-blue-100 font-normal">Total:</span>
                    <span className="text-lg">
                      S/ {Number(importeTotal || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </TabPanel>

          <TabPanel id="documentos" activeTab={activeTab}>
            <div className="bg-blue-50 p-6 rounded-lg space-y-6">
              {/* GRUPO 1: PRESENTACIÓN */}
              <section>
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">
                  📂 Documentos de Presentación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DocumentField
                    label="Oficio Presentación Facultad"
                    placeholder="001-VIRTUAL-2026-DUPG-FICSA"
                    value={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_presentacion_facultad : docExterno.numero_oficio_presentacion_facultad}
                    onChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({ ...docInterno, numero_oficio_presentacion_facultad: v })
                      : setDocExterno({ ...docExterno, numero_oficio_presentacion_facultad: v })}
                    urlValue={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_presentacion_facultad_url : docExterno.numero_oficio_presentacion_facultad_url}
                    onUrlChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({ ...docInterno, numero_oficio_presentacion_facultad_url: v })
                      : setDocExterno({ ...docExterno, numero_oficio_presentacion_facultad_url: v })}
                  />
                  <DocumentField
                    label="Oficio Presentación Coordinador"
                    placeholder="001-JEAV"
                    value={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_presentacion_coordinador : docExterno.numero_oficio_presentacion_coordinador}
                    onChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({ ...docInterno, numero_oficio_presentacion_coordinador: v })
                      : setDocExterno({ ...docExterno, numero_oficio_presentacion_coordinador: v })}
                    urlValue={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_presentacion_coordinador_url : docExterno.numero_oficio_presentacion_coordinador_url}
                    onUrlChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({ ...docInterno, numero_oficio_presentacion_coordinador_url: v })
                      : setDocExterno({ ...docExterno, numero_oficio_presentacion_coordinador_url: v })}
                  />
                </div>
              </section>
              <hr className="border-gray-200" />
              {docente?.tipo_docente === 'externo' && (
                <>
                  <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      📂 Generar Resolución de Aprobación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <DocumentField
                        label="Resolución de Aprobación"
                        placeholder="004-2026-EPG-D"
                        value={docExterno.numero_resolucion_aprobacion}
                        onChange={(v: string) => setDocExterno({ ...docExterno, numero_resolucion_aprobacion: v })}
                        urlValue=""
                        onUrlChange={() => { }}
                      />
                      <div>
                        <Label>Fecha Resolución Aprobación</Label>
                        <Input
                          type="date"
                          value={docExterno.fecha_resolucion_aprobacion}
                          onChange={(e) => setDocExterno({ ...docExterno, fecha_resolucion_aprobacion: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Pedido de Servicio</Label>
                        <Input
                          value={pedidoServicio}
                          placeholder="001-2026"
                          onChange={(e) => setPedidoServicio(e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </section>
                </>
              )}

            </div>
          </TabPanel>

          {/* Tab exclusivo para Documentos Internos */}
          <TabPanel id="documentos-internos" activeTab={activeTab}>
            {/* GRUPO 3: CONFORMIDAD */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <section>
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">
                  ✅ Documentos de Conformidad e Informe
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* El Informe Final ahora encabeza este grupo */}
                  <DocumentField
                    label="Oficio Conformidad Dirección"
                    placeholder="003-D-2026-EPG"
                    value={docInterno.numero_oficio_conformidad_direccion}
                    onChange={(v: string) => setDocInterno({ ...docInterno, numero_oficio_conformidad_direccion: v })}
                    urlValue={docInterno.numero_oficio_conformidad_direccion_url}
                    onUrlChange={(v: string) => setDocInterno({ ...docInterno, numero_oficio_conformidad_direccion_url: v })}
                  />

                  <DocumentField
                    label="Oficio Conformidad Facultad"
                    placeholder="002-VIRTUAL-2025-DUPG-FICSA"
                    value={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_conformidad_facultad : docExterno.numero_oficio_conformidad_facultad}
                    onChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({ ...docInterno, numero_oficio_conformidad_facultad: v })
                      : setDocExterno({ ...docExterno, numero_oficio_conformidad_facultad: v })}
                    urlValue={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_conformidad_facultad_url : docExterno.numero_oficio_conformidad_facultad_url}
                    onUrlChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({ ...docInterno, numero_oficio_conformidad_facultad_url: v })
                      : setDocExterno({ ...docExterno, numero_oficio_conformidad_facultad_url: v })}
                  />
                  <DocumentField
                    label="Oficio Conformidad Coordinador"
                    placeholder="002-JEAV"
                    value={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_conformidad_coordinador : docExterno.numero_oficio_conformidad_coordinador}
                    onChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({ ...docInterno, numero_oficio_conformidad_coordinador: v })
                      : setDocExterno({ ...docExterno, numero_oficio_conformidad_coordinador: v })}
                    urlValue={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_conformidad_coordinador_url : docExterno.numero_oficio_conformidad_coordinador_url}
                    onUrlChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({ ...docInterno, numero_oficio_conformidad_coordinador_url: v })
                      : setDocExterno({ ...docExterno, numero_oficio_conformidad_coordinador_url: v })}
                  />

                </div>
                {docente?.tipo_docente === 'externo' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <DocumentField
                      label="Informe Final"
                      placeholder="001-JEAV"
                      value={numeroInformeFinal}
                      onChange={setNumeroInformeFinal}
                      urlValue={numeroInformeFinalUrl}
                      onUrlChange={setNumeroInformeFinalUrl}
                    />
                    <DocumentField
                      label="Recibo por Honorario"
                      placeholder="E001-10"
                      value={docExterno.numero_recibo_honorario}
                      onChange={(v: string) => setDocExterno({ ...docExterno, numero_recibo_honorario: v })}
                      urlValue={docExterno.numero_recibo_honorario_url}
                      onUrlChange={(v: string) => setDocExterno({ ...docExterno, numero_recibo_honorario_url: v })}
                    />
                    <div>
                      <Label>Fecha Recibo Honorario</Label>
                      <Input
                        type="date"
                        value={docExterno.fecha_recibo_honorario}
                        onChange={(e) => setDocExterno({ ...docExterno, fecha_recibo_honorario: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>¿Retención del 8%? *</Label>
                      <select
                        value={docExterno.tiene_retencion_8_porciento ? 'si' : 'no'}
                        onChange={(e) => setDocExterno({ ...docExterno, tiene_retencion_8_porciento: e.target.value === 'si' })}
                        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                      >
                        <option value="no">No</option>
                        <option value="si">Sí</option>
                      </select>
                    </div>
                  </div>
                )}
              </section>

              <hr className="border-gray-200 mt-6" />
              <section>
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4 mt-6">📑 Generar Resolución de Pago y Oficio de Contabilidad</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <DocumentField
                    label="Resolución de Pago"
                    placeholder="005-2026-EPG-D"
                    value={docente?.tipo_docente === 'interno' ? docInterno.numero_resolucion_pago : docExterno.numero_resolucion_pago}
                    onChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({ ...docInterno, numero_resolucion_pago: v })
                      : setDocExterno({ ...docExterno, numero_resolucion_pago: v })}
                    urlValue={docente?.tipo_docente === 'interno' ? docInterno.numero_resolucion_url : docExterno.numero_resolucion_url}
                    onUrlChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({ ...docInterno, numero_resolucion_url: v })
                      : setDocExterno({ ...docExterno, numero_resolucion_url: v })}
                  />
                  <div>
                    <Label>Fecha Resolución</Label>
                    <Input
                      type="date"
                      value={docente?.tipo_docente === 'interno' ? docInterno.fecha_resolucion : docExterno.fecha_resolucion}
                      onChange={(e) => docente?.tipo_docente === 'interno'
                        ? setDocInterno({ ...docInterno, fecha_resolucion: e.target.value })
                        : setDocExterno({ ...docExterno, fecha_resolucion: e.target.value })}
                    />
                  </div>
                  <DocumentField
                    label="Oficio Contabilidad"
                    placeholder="006-2026-UC-EPG-UNPRG"
                    value={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_contabilidad : docExterno.numero_oficio_contabilidad}
                    onChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({ ...docInterno, numero_oficio_contabilidad: v })
                      : setDocExterno({ ...docExterno, numero_oficio_contabilidad: v })}
                    urlValue={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_contabilidad_url : docExterno.numero_oficio_contabilidad_url}
                    onUrlChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({ ...docInterno, numero_oficio_contabilidad_url: v })
                      : setDocExterno({ ...docExterno, numero_oficio_contabilidad_url: v })}
                  />
                  <div>
                    <Label>Fecha Oficio Contabilidad</Label>
                    <Input
                      type="date"
                      value={docente?.tipo_docente === 'interno' ? docInterno.fecha_oficio_contabilidad : docExterno.fecha_oficio_contabilidad}
                      onChange={(e) => docente?.tipo_docente === 'interno'
                        ? setDocInterno({ ...docInterno, fecha_oficio_contabilidad: e.target.value })
                        : setDocExterno({ ...docExterno, fecha_oficio_contabilidad: e.target.value })}
                    />
                  </div>
                </div>
              </section>
            </div>
          </TabPanel>

          {/* Tab para Doc Recibido */}
          <TabPanel id="doc-recibido" activeTab={activeTab}>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold text-purple-800 mb-6">📬 Documentos Recibidos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-sm">Orden de Servicio</Label>
                  <Input
                    value={ordenServicio}
                    placeholder="002-2026"
                    onChange={(e) => setOrdenServicio(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-sm">Acta de Conformidad</Label>
                  <Input
                    value={actaConformidad}
                    placeholder="003-2026"
                    onChange={(e) => setActaConformidad(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-sm">N° Exp SIAF</Label>
                  <Input
                    value={numeroExpSiaf}
                    placeholder="0001"
                    onChange={(e) => setNumeroExpSiaf(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-2">
                  <div>
                    <Label className="text-sm">Nota de Pago (S/. {docExterno.tiene_retencion_8_porciento ? (0.92 * importeTotal).toFixed(2) : importeTotal.toFixed(2)})</Label>
                    <Input
                      value={notaPago}
                      placeholder="0001"
                      onChange={(e) => setNotaPago(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Fecha Nota de Pago</Label>
                    <Input
                      type="date"
                      value={fechaNotaPago}
                      onChange={(e) => setFechaNotaPago(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  {docente?.tipo_docente === 'externo' && docExterno.tiene_retencion_8_porciento && (
                    <>
                      <div>
                        <Label className="text-sm">2° Nota de Pago (S/. {docExterno.tiene_retencion_8_porciento ? (0.08 * importeTotal).toFixed(2) : importeTotal.toFixed(2)})</Label>
                        <Input
                          value={notaPago2}
                          placeholder="0002"
                          onChange={(e) => setNotaPago2(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Fecha 2° Nota de Pago</Label>
                        <Input
                          type="date"
                          value={fechaNotaPago2}
                          onChange={(e) => setFechaNotaPago2(e.target.value)}
                          className="h-9"
                        />
                      </div>

                    </>
                  )}
                  <div>
                    <Label className="text-sm">Fecha de Pago</Label>
                    <Input
                      type="date"
                      value={fechaPago}
                      onChange={(e) => setFechaPago(e.target.value)}
                      className="h-9"
                    />
                  </div>

                </div>

              </div>
              <DocumentField
                label="Oficio de Pago de Dirección"
                placeholder="007-D-2026-EPG"
                value={numeroOficioPagoDireccion}
                onChange={(v: string) => setNumeroOficioPagoDireccion(v)}
                urlValue={numeroOficioPagoDireccionUrl}
                onUrlChange={(v: string) => setNumeroOficioPagoDireccionUrl(v)}
                showUpload={true}
              />
            </div>
          </TabPanel>

        </Card>

        {/* Botones */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" size="lg" onClick={() => navigate('/pagos-docentes')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} size="lg" className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Guardando...
              </>
            ) : (
              <>
                <span className="mr-2">💾</span>
                {id ? 'Actualizar Pago' : 'Guardar Pago'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
