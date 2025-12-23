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

interface Docente {
  id: number;
  label: string;
  tipo_docente: 'interno' | 'externo';
}

interface Curso {
  id: number;
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
const DocumentField = ({ label, value, onChange, urlValue, onUrlChange, showUpload = false }: any) => (
  <div className="space-y-3">
    <div className={showUpload ? "grid grid-cols-2 gap-3" : ""}>
      <div>
        <Label className="text-sm">{label}</Label>
        <Input 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="h-9"
          placeholder="Número"
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

export default function PagoDocenteForm() {
  const { id } = useParams();
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
    numero_resolucion: '',
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
    numero_pedido_servicio: '',
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
    numero_resolucion: '',
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
            alert('Error: Datos de docente no encontrados');
            navigate('/pagos-docentes');
            return;
          }

          if (!data.curso) {
            console.error('Datos de curso no encontrados');
            alert('Error: Datos de curso no encontrados');
            navigate('/pagos-docentes');
            return;
          }

          // Poblar estados
          setDocente({
            id: data.docente_id,
            label: `${data.docente.nombres} ${data.docente.apellido_paterno} ${data.docente.apellido_materno}`,
            tipo_docente: data.docente.tipo_docente
          });

          setCurso({
            id: data.curso_id,
            label: `${data.curso.nombre} (${data.periodo})`,
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

          // Poblar documentos internos/externos según corresponda
          if (data.docente.tipo_docente === 'interno') {
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
              numero_resolucion: data.numero_resolucion || '',
              numero_resolucion_url: data.numero_resolucion_url || '',
              fecha_resolucion: data.fecha_resolucion || '',
              numero_oficio_contabilidad: data.numero_oficio_contabilidad || '',
              numero_oficio_contabilidad_url: data.numero_oficio_contabilidad_url || '',
              fecha_oficio_contabilidad: data.fecha_oficio_contabilidad || '',
            });
          } else {
            setDocExterno({
              tiene_retencion_8_porciento: data.tiene_retencion_8_porciento || false,
              numero_recibo_honorario: data.numero_recibo_honorario || '',
              numero_recibo_honorario_url: data.numero_recibo_honorario_url || '',
              fecha_recibo_honorario: data.fecha_recibo_honorario || '',
              numero_pedido_servicio: data.numero_pedido_servicio || '',
              numero_pedido_servicio_url: data.numero_pedido_servicio_url || '',
              // Mapear campos comunes
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
              numero_resolucion: data.numero_resolucion || '',
              numero_resolucion_url: data.numero_resolucion_url || '',
              fecha_resolucion: data.fecha_resolucion || '',
              numero_oficio_contabilidad: data.numero_oficio_contabilidad || '',
              numero_oficio_contabilidad_url: data.numero_oficio_contabilidad_url || '',
              fecha_oficio_contabilidad: data.fecha_oficio_contabilidad || '',
            });
          }

          setDatosCurso({
            programa_id: 0,
            programa_nombre: data.programa_nombre || '',
            periodo: data.periodo,
            facultad_nombre: data.facultad_nombre,
            director_nombre: data.director_nombre,
            coordinador_nombre: data.coordinador_nombre,
          });

        } catch (error) {
          console.error('Error al cargar pago:', error);
          alert('Error al cargar los datos del pago');
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
    if (curso && !id) { // Solo si no es edición o si cambia el curso
      const fetchDatosCurso = async () => {
        try {
          const response = await axios.get(`/pagos-docentes/curso/${curso.id}/datos`);
          setDatosCurso(response.data.data);
          setPeriodo(response.data.data.periodo);
        } catch (error) {
          console.error('Error al cargar datos del curso:', error);
        }
      };
      fetchDatosCurso();
    }
  }, [curso, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!docente || !curso || !periodo || fechasEnsenanza.length === 0) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        docente_id: docente.id,
        curso_id: curso.id,
        periodo: periodo,
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
        ...(docente.tipo_docente === 'interno' ? docInterno : {}),
        ...(docente.tipo_docente === 'externo' ? docExterno : {}),
      };

      if (id) {
        await axios.put(`/pagos-docentes/${id}`, payload);
        alert('Pago actualizado exitosamente');
      } else {
        await axios.post('/pagos-docentes', payload);
        alert('Pago registrado exitosamente');
      }
      navigate('/pagos-docentes');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el pago');
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
      { id: 'documentos', label: 'Documentos', icon: '📄' },
      { id: 'documentos-internos', label: 'Docs. Internos', icon: '📑' },
    ];

    if (docente?.tipo_docente === 'externo') {
      baseTabs.push({ id: 'documentos-externos', label: 'Docs. Externos', icon: '📑' });
    }

    baseTabs.push({ id: 'doc-recibido', label: 'Doc Recibido', icon: '📬' });

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
                  onChange={(option) => setCurso(option as Curso | null)}
                  placeholder="Buscar por código o nombre..."
                />
                <div>
                  <Label>Programa</Label>
                  <Input value={datosCurso.programa_nombre || ''} disabled className="bg-gray-50" />
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel id="calculos" activeTab={activeTab}>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>N° de Horas *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={numeroHoras}
                    onChange={(e) => setNumeroHoras(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Costo por Hora *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={costoPorHora}
                    onChange={(e) => setCostoPorHora(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Importe Total</Label>
                  <Input
                    value={Number(importeTotal || 0).toFixed(2)}
                    disabled
                    className="font-semibold bg-blue-50"
                  />
                </div>
              </div>
              
              <div>
                <Label>Importe en Letras</Label>
                <textarea
                  value={importeLetras}
                  disabled
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm"
                />
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Fechas de Enseñanza *</h3>
                <CalendarioMultiple
                  label=""
                  selectedDates={fechasEnsenanza}
                  onChange={setFechasEnsenanza}
                  highlightWeekends={true}
                />
              </div>
            </div>
          </TabPanel>

          <TabPanel id="documentos" activeTab={activeTab}>
            <div className="space-y-6">
              {/* Documentos Generales (para ambos tipos) */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">📄 Documentos Generales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DocumentField
                    label="Informe Final"
                    value={numeroInformeFinal}
                    onChange={setNumeroInformeFinal}
                    urlValue={numeroInformeFinalUrl}
                    onUrlChange={setNumeroInformeFinalUrl}
                  />
                  <DocumentField
                    label="Oficio Presentación Facultad"
                    value={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_presentacion_facultad : docExterno.numero_oficio_presentacion_facultad}
                    onChange={(v: string) => docente?.tipo_docente === 'interno' 
                      ? setDocInterno({...docInterno, numero_oficio_presentacion_facultad: v})
                      : setDocExterno({...docExterno, numero_oficio_presentacion_facultad: v})}
                    urlValue={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_presentacion_facultad_url : docExterno.numero_oficio_presentacion_facultad_url}
                    onUrlChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({...docInterno, numero_oficio_presentacion_facultad_url: v})
                      : setDocExterno({...docExterno, numero_oficio_presentacion_facultad_url: v})}
                  />
                  <DocumentField
                    label="Oficio Presentación Coordinador"
                    value={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_presentacion_coordinador : docExterno.numero_oficio_presentacion_coordinador}
                    onChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({...docInterno, numero_oficio_presentacion_coordinador: v})
                      : setDocExterno({...docExterno, numero_oficio_presentacion_coordinador: v})}
                    urlValue={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_presentacion_coordinador_url : docExterno.numero_oficio_presentacion_coordinador_url}
                    onUrlChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({...docInterno, numero_oficio_presentacion_coordinador_url: v})
                      : setDocExterno({...docExterno, numero_oficio_presentacion_coordinador_url: v})}
                  />
                  <DocumentField
                    label="Oficio Conformidad Facultad"
                    value={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_conformidad_facultad : docExterno.numero_oficio_conformidad_facultad}
                    onChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({...docInterno, numero_oficio_conformidad_facultad: v})
                      : setDocExterno({...docExterno, numero_oficio_conformidad_facultad: v})}
                    urlValue={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_conformidad_facultad_url : docExterno.numero_oficio_conformidad_facultad_url}
                    onUrlChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({...docInterno, numero_oficio_conformidad_facultad_url: v})
                      : setDocExterno({...docExterno, numero_oficio_conformidad_facultad_url: v})}
                  />
                  <DocumentField
                    label="Oficio Conformidad Coordinador"
                    value={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_conformidad_coordinador : docExterno.numero_oficio_conformidad_coordinador}
                    onChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({...docInterno, numero_oficio_conformidad_coordinador: v})
                      : setDocExterno({...docExterno, numero_oficio_conformidad_coordinador: v})}
                    urlValue={docente?.tipo_docente === 'interno' ? docInterno.numero_oficio_conformidad_coordinador_url : docExterno.numero_oficio_conformidad_coordinador_url}
                    onUrlChange={(v: string) => docente?.tipo_docente === 'interno'
                      ? setDocInterno({...docInterno, numero_oficio_conformidad_coordinador_url: v})
                      : setDocExterno({...docExterno, numero_oficio_conformidad_coordinador_url: v})}
                  />
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Tab exclusivo para Documentos Internos */}
          <TabPanel id="documentos-internos" activeTab={activeTab}>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold text-blue-800 mb-6">📑 Documentos Internos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocumentField
                  label="Oficio Conformidad Dirección"
                  value={docInterno.numero_oficio_conformidad_direccion}
                  onChange={(v: string) => setDocInterno({...docInterno, numero_oficio_conformidad_direccion: v})}
                  urlValue={docInterno.numero_oficio_conformidad_direccion_url}
                  onUrlChange={(v: string) => setDocInterno({...docInterno, numero_oficio_conformidad_direccion_url: v})}
                />
                <DocumentField
                  label="Resolución"
                  value={docInterno.numero_resolucion}
                  onChange={(v: string) => setDocInterno({...docInterno, numero_resolucion: v})}
                  urlValue={docInterno.numero_resolucion_url}
                  onUrlChange={(v: string) => setDocInterno({...docInterno, numero_resolucion_url: v})}
                />
                <div>
                  <Label>Fecha Resolución</Label>
                  <Input
                    type="date"
                    value={docInterno.fecha_resolucion}
                    onChange={(e) => setDocInterno({...docInterno, fecha_resolucion: e.target.value})}
                  />
                </div>
                <DocumentField
                  label="Oficio Contabilidad"
                  value={docInterno.numero_oficio_contabilidad}
                  onChange={(v: string) => setDocInterno({...docInterno, numero_oficio_contabilidad: v})}
                  urlValue={docInterno.numero_oficio_contabilidad_url}
                  onUrlChange={(v: string) => setDocInterno({...docInterno, numero_oficio_contabilidad_url: v})}
                />
                <div>
                  <Label>Fecha Oficio Contabilidad</Label>
                  <Input
                    type="date"
                    value={docInterno.fecha_oficio_contabilidad}
                    onChange={(e) => setDocInterno({...docInterno, fecha_oficio_contabilidad: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Tab exclusivo para Documentos Externos */}
          <TabPanel id="documentos-externos" activeTab={activeTab}>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold text-green-800 mb-6">📑 Documentos Externos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>¿Retención del 8%? *</Label>
                  <select
                    value={docExterno.tiene_retencion_8_porciento ? 'si' : 'no'}
                    onChange={(e) => setDocExterno({...docExterno, tiene_retencion_8_porciento: e.target.value === 'si'})}
                    className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                  >
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
                <DocumentField
                  label="Recibo por Honorario"
                  value={docExterno.numero_recibo_honorario}
                  onChange={(v: string) => setDocExterno({...docExterno, numero_recibo_honorario: v})}
                  urlValue={docExterno.numero_recibo_honorario_url}
                  onUrlChange={(v: string) => setDocExterno({...docExterno, numero_recibo_honorario_url: v})}
                />
                <div>
                  <Label>Fecha Recibo Honorario</Label>
                  <Input
                    type="date"
                    value={docExterno.fecha_recibo_honorario}
                    onChange={(e) => setDocExterno({...docExterno, fecha_recibo_honorario: e.target.value})}
                  />
                </div>
                <DocumentField
                  label="Pedido de Servicio"
                  value={docExterno.numero_pedido_servicio}
                  onChange={(v: string) => setDocExterno({...docExterno, numero_pedido_servicio: v})}
                  urlValue={docExterno.numero_pedido_servicio_url}
                  onUrlChange={(v: string) => setDocExterno({...docExterno, numero_pedido_servicio_url: v})}
                />
              </div>
            </div>
          </TabPanel>

          {/* Tab para Doc Recibido */}
          <TabPanel id="doc-recibido" activeTab={activeTab}>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold text-purple-800 mb-6">📬 Documento Recibido</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocumentField
                  label="Oficio de Pago de Dirección"
                  value={numeroOficioPagoDireccion}
                  onChange={(v: string) => setNumeroOficioPagoDireccion(v)}
                  urlValue={numeroOficioPagoDireccionUrl}
                  onUrlChange={(v: string) => setNumeroOficioPagoDireccionUrl(v)}
                  showUpload={true}
                />
              </div>
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
