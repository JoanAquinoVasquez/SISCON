import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import { SelectConBusqueda } from '@/components/ui/select-con-busqueda';
import { ComboboxEditable } from '@/components/ui/combobox-editable';
import { CalendarioMultiple } from '@/components/ui/calendario-multiple';
import { ArrowLeft, Plus } from 'lucide-react';
import DocenteCursoBlock from './DocenteCursoBlock';
import { useToast } from '@/context/ToastContext';

export default function ExpedienteForm() {
  const { showToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('general');

  // General fields
  const [numeroExpedienteMP, setNumeroExpedienteMP] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [fechaMesaPartes, setFechaMesaPartes] = useState('');
  const [fechaRecepcion, setFechaRecepcion] = useState(() => {
    const date = new Date();
    return date.toLocaleDateString('en-CA');
  });
  const [remitente, setRemitente] = useState<any>(null);

  // Asunto fields
  const [tipoAsunto, setTipoAsunto] = useState<'descripcion' | 'presentacion' | 'conformidad' | 'devolucion'>('descripcion');
  const [descripcionAsunto, setDescripcionAsunto] = useState('');

  // Coordinator document fields
  const [numeroOficioPresentacionCoordinador, setNumeroOficioPresentacionCoordinador] = useState('');
  const [numeroOficioConformidadCoordinador, setNumeroOficioConformidadCoordinador] = useState('');
  const [numeroOficioConformidadFacultad, setNumeroOficioConformidadFacultad] = useState('');

  // Docente/Curso fields (for presentacion/conformidad)
  const [docente, setDocente] = useState<any>(null);
  const [curso, setCurso] = useState<any>(null);
  const [fechasEnsenanza, setFechasEnsenanza] = useState<any[]>([]);

  // Multiple docentes-cursos (for exceptional cases)
  const [docentesCursos, setDocentesCursos] = useState<any[]>([]);
  const [usarMultiple, setUsarMultiple] = useState(false);

  // Faculty code for filtering courses
  const [facultadCodigo, setFacultadCodigo] = useState('');

  // Devolucion fields
  const [personaDevolucion, setPersonaDevolucion] = useState('');
  const [dniDevolucion, setDniDevolucion] = useState('');
  const [programaDevolucion, setProgramaDevolucion] = useState<any>(null);
  const [tipoDevolucion, setTipoDevolucion] = useState('');
  const [importeDevolucion, setImporteDevolucion] = useState('');
  const [numeroVoucher, setNumeroVoucher] = useState('');

  useEffect(() => {
    if (id) {
      fetchExpediente();
    }
  }, [id]);

  // Auto-fill persona with remitente when tipo_asunto is devolucion
  useEffect(() => {
    if (tipoAsunto === 'devolucion' && remitente && !personaDevolucion) {
      const nombreRemitente = remitente?.nombre || remitente?.label || '';
      setPersonaDevolucion(nombreRemitente);
    }
  }, [tipoAsunto, remitente]);

  // Auto-fill importe based on tipo_devolucion
  useEffect(() => {
    if (tipoDevolucion) {
      const importes: Record<string, string> = {
        'inscripcion': '250.00',
        'idiomas': '120.00',
        'grados_titulos': '850.00',
      };
      setImporteDevolucion(importes[tipoDevolucion] || '');
    }
  }, [tipoDevolucion]);

  // Auto-detect faculty code from numeroDocumento and fill remitente
  useEffect(() => {
    if (!numeroDocumento || numeroDocumento.length < 3) {
      setFacultadCodigo('');
      return;
    }

    // Debounce the search to avoid too many requests
    const timeoutId = setTimeout(() => {
      searchDirectorByCode();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [numeroDocumento]);

  const searchDirectorByCode = async () => {
    try {
      // Primero verificar si contiene "EPG" o "Posgrado"
      const epgRegex = /\b(EPG|POSGRADO)\b/i;
      if (epgRegex.test(numeroDocumento)) {
        // Buscar específicamente el director de EPG
        const response = await axios.get('/expedientes/buscar-directores?q=EPG');
        const directors = response.data.data || [];
        const epgDirector = directors.find((d: any) => d.id === 'epg_director');

        if (epgDirector && !remitente) {
          setRemitente(epgDirector);
          return; // Salir temprano si encontramos EPG
        }
      }

      //Verificar si tiene DGA-UA
      const dgaRegex = /\b(DGA|UA)\b/i;
      if (dgaRegex.test(numeroDocumento)) {
        // Buscar específicamente el director de EPG
        const response = await axios.get('/expedientes/buscar-directores?q=DGA-UNPRG');
        const directors = response.data.data || [];
        const epgDirector = directors.find((d: any) => d.id === 'mg_carranza');

        if (epgDirector && !remitente) {
          setRemitente(epgDirector);
          return; // Salir temprano si encontramos EPG
        }
      }

      //Verificar si tiene DGA/UA
      const dgaUaRegex = /\b(DGA|UA)\b/i;
      if (dgaUaRegex.test(numeroDocumento)) {
        // Buscar específicamente el director de EPG
        const response = await axios.get('/expedientes/buscar-directores?q=DGA/UA');
        const directors = response.data.data || [];
        const epgDirector = directors.find((d: any) => d.id === 'mg_yalta');

        if (epgDirector && !remitente) {
          setRemitente(epgDirector);
          return; // Salir temprano si encontramos EPG
        }
      }


      // Si no es EPG, buscar por código de facultad
      const response = await axios.get('/expedientes/buscar-directores?q=all');
      const allDirectors = response.data.data || [];

      // Try to find a director whose faculty code appears in the document number
      // Look for the code as a separate word or surrounded by delimiters
      const matchedDirector = allDirectors.find((director: any) => {
        if (director.codigo) {
          // Match codigo as a whole word or surrounded by non-letter characters
          const regex = new RegExp(`(^|[^A-Za-z])${director.codigo}([^A-Za-z]|$)`, 'i');
          const match = regex.test(numeroDocumento);

          if (match) {

            setFacultadCodigo(director.codigo);
            return true;
          }
        }
        return false;
      });

      if (matchedDirector && !remitente) {
        setRemitente(matchedDirector);
      } else if (!matchedDirector) {

        setFacultadCodigo('');
      }
    } catch (error) {
      console.error('Error searching director by faculty code:', error);
    }
  };

  const fetchExpediente = async () => {
    try {
      const response = await axios.get(`/expedientes/${id}`);
      const data = response.data.data;
      console.log(data);
      setNumeroExpedienteMP(data.numero_expediente_mesa_partes || '');
      setNumeroDocumento(data.numero_documento);

      // Formatear fechas para inputs type="date" (solo YYYY-MM-DD)
      // Manejar tanto formato ISO (T) como SQL (espacio)
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return dateStr.split('T')[0].split(' ')[0];
      };

      setFechaMesaPartes(formatDate(data.fecha_mesa_partes));
      setFechaRecepcion(formatDate(data.fecha_recepcion_contabilidad));

      // Parse remitente as object for SelectConBusqueda
      if (data.remitente) {
        setRemitente({
          id: 'custom',
          label: data.remitente,
          nombre: data.remitente,
        });
      }

      setTipoAsunto(data.tipo_asunto);
      setDescripcionAsunto(data.descripcion_asunto || '');

      if (data.docente) {
        setDocente({
          id: data.docente.id,
          label: `${data.docente.titulo_profesional} ${data.docente.nombres} ${data.docente.apellido_paterno} ${data.docente.apellido_materno} - Docente ${data.docente.tipo_docente}`,
        });
      }

      if (data.curso) {
        setCurso({
          id: data.curso.id,
          label: `${data.curso.nombre} (${data.semestre.programa.grado.nombre} en ${data.semestre.programa.nombre} ${data.semestre.programa.periodo}) `,
        });
      }

      setFechasEnsenanza(data.fechas_ensenanza || []);
      setNumeroOficioPresentacionCoordinador(data.pago_docente?.numero_oficio_presentacion_coordinador || '');
      setNumeroOficioConformidadCoordinador(data.pago_docente?.numero_oficio_conformidad_coordinador || '');
      setNumeroOficioConformidadFacultad(data.pago_docente?.numero_oficio_conformidad_facultad || '');

      // Devolucion fields
      setPersonaDevolucion(data.persona_devolucion || '');
      setDniDevolucion(data.dni_devolucion || '');
      if (data.programa) {
        setProgramaDevolucion({
          id: data.programa.id,
          label: data.programa.nombre,
        });
      }
      setTipoDevolucion(data.tipo_devolucion || '');
      setImporteDevolucion(data.importe_devolucion || '');
      setNumeroVoucher(data.numero_voucher || '');
    } catch (error) {
      console.error('Error al cargar expediente:', error);
      showToast('Error al cargar el expediente', 'error');
    }
  };

  // Funciones para manejar múltiples docentes-cursos
  const agregarDocenteCurso = () => {
    setDocentesCursos([...docentesCursos, {
      docente: null,
      curso: null,
      fechas_ensenanza: [],
      numero_oficio_coordinador: ''
    }]);
  };

  const eliminarDocenteCurso = (index: number) => {
    setDocentesCursos(docentesCursos.filter((_, i) => i !== index));
  };

  const actualizarDocenteCurso = (index: number, field: string, value: any) => {
    const nuevosDocentesCursos = [...docentesCursos];
    nuevosDocentesCursos[index] = {
      ...nuevosDocentesCursos[index],
      [field]: value
    };
    setDocentesCursos(nuevosDocentesCursos);
  };

  const activarModoMultiple = () => {
    setUsarMultiple(true);
    // Inicializar con el docente-curso actual si existe
    if (docente && curso) {
      setDocentesCursos([{
        docente,
        curso,
        fechas_ensenanza: fechasEnsenanza,
        numero_oficio_coordinador: tipoAsunto === 'presentacion' ? numeroOficioPresentacionCoordinador : numeroOficioConformidadCoordinador
      }]);
    } else {
      setDocentesCursos([{
        docente: null,
        curso: null,
        fechas_ensenanza: [],
        numero_oficio_coordinador: ''
      }]);
    }
  };

  const desactivarModoMultiple = () => {
    setUsarMultiple(false);
    // Restaurar el primer docente-curso si existe
    if (docentesCursos.length > 0) {
      setDocente(docentesCursos[0].docente);
      setCurso(docentesCursos[0].curso);
      setFechasEnsenanza(docentesCursos[0].fechas_ensenanza);
      if (tipoAsunto === 'presentacion') {
        setNumeroOficioPresentacionCoordinador(docentesCursos[0].numero_oficio_coordinador || '');
      } else {
        setNumeroOficioConformidadCoordinador(docentesCursos[0].numero_oficio_coordinador || '');
      }
    }
    setDocentesCursos([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!numeroDocumento || !fechaMesaPartes || !fechaRecepcion || !remitente) {
      showToast('Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    if (tipoAsunto === 'descripcion' && !descripcionAsunto) {
      showToast('Por favor ingrese la descripción del asunto', 'warning');
      return;
    }

    // Validación para presentacion/conformidad
    if (tipoAsunto === 'presentacion' || tipoAsunto === 'conformidad') {
      if (usarMultiple) {
        // Validar que haya al menos un docente-curso completo
        if (docentesCursos.length === 0 || !docentesCursos.every(dc => dc.docente && dc.curso)) {
          showToast('Por favor complete al menos un docente y curso', 'warning');
          return;
        }
      } else {
        // Validación normal
        if (!docente || !curso) {
          showToast('Por favor complete los datos del docente y curso', 'warning');
          return;
        }
      }
    }

    if (tipoAsunto === 'devolucion' && (!personaDevolucion || !dniDevolucion || !programaDevolucion || !tipoDevolucion || !importeDevolucion || !numeroVoucher)) {
      showToast('Por favor complete todos los campos de devolución', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        numero_expediente_mesa_partes: numeroExpedienteMP || null,
        numero_documento: numeroDocumento,
        fecha_mesa_partes: fechaMesaPartes,
        fecha_recepcion_contabilidad: fechaRecepcion,
        remitente: remitente?.nombre || remitente?.label || '',
        tipo_asunto: tipoAsunto,
        descripcion_asunto: tipoAsunto === 'descripcion' ? descripcionAsunto : null,
      };

      // Si es presentacion/conformidad y usa múltiple, agregar array
      if ((tipoAsunto === 'presentacion' || tipoAsunto === 'conformidad') && usarMultiple && docentesCursos.length > 0) {
        payload.docentes_cursos = docentesCursos.map(dc => {
          let cursoId = dc.curso?.id;
          let semestreId = dc.curso?.semestre_id;

          // Handle composite ID if present (format: curso_id-semestre_id)
          if (dc.curso?.id && typeof dc.curso.id === 'string' && dc.curso.id.includes('-')) {
            const parts = dc.curso.id.split('-');
            cursoId = parts[0];
            semestreId = parts[1];
          }

          const item: any = {
            docente_id: dc.docente?.id,
            curso_id: cursoId,
            semestre_id: semestreId,
            fechas_ensenanza: dc.fechas_ensenanza || [],
          };

          if (tipoAsunto === 'presentacion') {
            item.numero_oficio_presentacion_coordinador = dc.numero_oficio_coordinador || null;
          } else if (tipoAsunto === 'conformidad') {
            item.numero_oficio_conformidad_coordinador = dc.numero_oficio_coordinador || null;
          }

          return item;
        });
      } else if (tipoAsunto === 'presentacion' || tipoAsunto === 'conformidad') {
        // Flujo normal (un solo docente-curso)
        let cursoId = curso?.id;
        let semestreId = curso?.semestre_id;

        // Handle composite ID if present (format: curso_id-semestre_id)
        if (curso?.id && typeof curso.id === 'string' && curso.id.includes('-')) {
          const parts = curso.id.split('-');
          cursoId = parts[0];
          semestreId = parts[1];
        }

        payload.docente_id = docente?.id;
        payload.curso_id = cursoId;
        payload.semestre_id = semestreId;
        payload.fechas_ensenanza = fechasEnsenanza;
        payload.numero_oficio_presentacion_coordinador = tipoAsunto === 'presentacion' ? numeroOficioPresentacionCoordinador : null;
        payload.numero_oficio_conformidad_coordinador = tipoAsunto === 'conformidad' ? numeroOficioConformidadCoordinador : null;
        payload.numero_oficio_conformidad_facultad = tipoAsunto === 'conformidad' ? numeroOficioConformidadFacultad : null;
      }

      // Devolucion fields
      if (tipoAsunto === 'devolucion') {
        payload.persona_devolucion = personaDevolucion;
        payload.dni_devolucion = dniDevolucion;
        payload.programa_id = programaDevolucion?.id;
        payload.tipo_devolucion = tipoDevolucion;
        payload.importe_devolucion = importeDevolucion;
        payload.numero_voucher = numeroVoucher;
      }


      if (id) {
        await axios.put(`/expedientes/${id}`, payload);
        showToast('Expediente actualizado exitosamente', 'success');
      } else {
        const response = await axios.post('/expedientes', payload);
        if (response.data.multiple) {
          showToast(`${response.data.data.length} expedientes registrados exitosamente`, 'success');
        } else {
          showToast('Expediente registrado exitosamente', 'success');
        }
      }
      navigate('/expedientes');
    } catch (error: any) {
      console.error('Error al guardar:', error);
      showToast(error.response?.data?.message || 'Error al guardar el expediente', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Información General', icon: '📋' },
    { id: 'asunto', label: 'Asunto', icon: '📝' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/expedientes')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Editar Expediente' : 'Nuevo Expediente'}
          </h1>
          <p className="text-gray-600 mt-1">Complete la información del documento recibido</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          {/* Tabs Navigation */}
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {/* Tab: Información General */}
          <TabPanel id="general" activeTab={activeTab}>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold text-blue-800 mb-6">📋 Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>N° Expediente Mesa de Partes (Opcional)</Label>
                  <Input
                    value={numeroExpedienteMP}
                    onChange={(e) => setNumeroExpedienteMP(e.target.value)}
                    placeholder="Ej: 001-2026-EPG-VIRTUAL"
                  />
                </div>
                <div>
                  <Label>Fecha de Mesa de Partes</Label>
                  <Input
                    type="date"
                    value={fechaMesaPartes}
                    onChange={(e) => setFechaMesaPartes(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>N° Documento *</Label>
                  <Input
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                    placeholder="Ej: OFICIO N° 001-D-2026-EPG"
                    required
                  />
                </div>

                <div>
                  <Label>Fecha de Recepción en Contabilidad *</Label>
                  <Input
                    type="date"
                    value={fechaRecepcion}
                    onChange={(e) => setFechaRecepcion(e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Remitente (Quien escribe) *</Label>
                  <ComboboxEditable
                    searchEndpoint="/expedientes/buscar-directores"
                    value={remitente}
                    onChange={setRemitente}
                    placeholder="Buscar director o escribir nombre..."
                  />
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Tab: Asunto */}
          <TabPanel id="asunto" activeTab={activeTab}>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold text-green-800 mb-6">📝 Asunto del Documento</h3>

              {/* Tipo de Asunto */}
              <div className="mb-6">
                <Label>Tipo de Asunto *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {[
                    { value: 'descripcion', label: 'Descripción General' },
                    { value: 'presentacion', label: 'Presentación' },
                    { value: 'conformidad', label: 'Conformidad' },
                    { value: 'devolucion', label: 'Devolución' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${tipoAsunto === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <input
                        type="radio"
                        name="tipo_asunto"
                        value={option.value}
                        checked={tipoAsunto === option.value}
                        onChange={(e) => setTipoAsunto(e.target.value as any)}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Conditional Fields */}
              {tipoAsunto === 'descripcion' ? (
                <div>
                  <Label>Descripción del Asunto *</Label>
                  <textarea
                    value={descripcionAsunto}
                    onChange={(e) => setDescripcionAsunto(e.target.value)}
                    className="w-full min-h-[120px] p-3 border rounded-lg"
                    placeholder="Describa el asunto del documento..."
                    required
                  />
                </div>
              ) : tipoAsunto === 'presentacion' || tipoAsunto === 'conformidad' ? (
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-gray-600">
                        Este documento se vinculará automáticamente con un pago docente. Complete los siguientes datos:
                      </p>
                      {!id && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={usarMultiple ? desactivarModoMultiple : activarModoMultiple}
                          className="ml-4"
                        >
                          {usarMultiple ? 'Modo Simple' : '+ Múltiples Docentes'}
                        </Button>
                      )}
                    </div>

                    {usarMultiple ? (
                      // Modo múltiple: renderizar bloques dinámicos
                      <div className="space-y-4">
                        {docentesCursos.map((dc, index) => (
                          <DocenteCursoBlock
                            key={index}
                            index={index}
                            docente={dc.docente}
                            curso={dc.curso}
                            fechasEnsenanza={dc.fechas_ensenanza}
                            numeroOficioCoordinador={dc.numero_oficio_coordinador}
                            tipoAsunto={tipoAsunto}
                            onDocenteChange={(value) => actualizarDocenteCurso(index, 'docente', value)}
                            onCursoChange={(value) => actualizarDocenteCurso(index, 'curso', value)}
                            onFechasChange={(value) => actualizarDocenteCurso(index, 'fechas_ensenanza', value)}
                            onOficioChange={(value) => actualizarDocenteCurso(index, 'numero_oficio_coordinador', value)}
                            onRemove={docentesCursos.length > 1 ? () => eliminarDocenteCurso(index) : undefined}
                            showRemove={docentesCursos.length > 1}
                          />
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={agregarDocenteCurso}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar otro docente-curso
                        </Button>
                      </div>
                    ) : (
                      // Modo simple: formulario normal
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label>Docente *</Label>
                          <SelectConBusqueda
                            label=""
                            searchEndpoint="/pagos-docentes/buscar-docente"
                            value={docente}
                            onChange={setDocente}
                            placeholder="Buscar docente..."
                          />
                        </div>
                        <div>
                          <Label>Curso *</Label>
                          <SelectConBusqueda
                            label=""
                            searchEndpoint="/pagos-docentes/buscar-curso"
                            value={curso}
                            onChange={setCurso}
                            placeholder="Buscar curso..."
                            additionalParams={{ facultad_codigo: facultadCodigo }}
                          />
                        </div>
                        {/* Coordinator document field */}
                        {tipoAsunto === 'presentacion' && (
                          <div>
                            <Label>N° Oficio Presentación Coordinador (Opcional)</Label>
                            <Input
                              value={numeroOficioPresentacionCoordinador}
                              onChange={(e) => setNumeroOficioPresentacionCoordinador(e.target.value)}
                              placeholder="Ej: 001-VIRTUAL-2026-DUPG-FICSA"
                            />
                          </div>
                        )}

                        {tipoAsunto === 'conformidad' && (
                          <>
                            <div>
                              <Label>N° Oficio Conformidad Facultad</Label>
                              <Input
                                value={numeroOficioConformidadFacultad}
                                onChange={(e) => setNumeroOficioConformidadFacultad(e.target.value)}
                                placeholder="Ej: 002-VIRTUAL-2025-DUPG-FICSA"
                                required={false}
                              />
                            </div>
                            <div>
                              <Label>N° Oficio Conformidad Coordinador (Opcional)</Label>
                              <Input
                                value={numeroOficioConformidadCoordinador}
                                onChange={(e) => setNumeroOficioConformidadCoordinador(e.target.value)}
                                placeholder="Ej: 002-JEAV"
                                required={false}
                              />
                            </div>
                          </>
                        )}

                        <div className="md:col-span-2">
                          <CalendarioMultiple
                            label="Fechas de Enseñanza"
                            selectedDates={fechasEnsenanza}
                            onChange={setFechasEnsenanza}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Devolucion fields
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-4">
                      Complete los datos de la devolución:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>Persona *</Label>
                        <Input
                          value={personaDevolucion}
                          onChange={(e) => setPersonaDevolucion(e.target.value)}
                          placeholder="Nombre completo"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Se auto-completa con el remitente</p>
                      </div>
                      <div>
                        <Label>DNI *</Label>
                        <Input
                          value={dniDevolucion}
                          onChange={(e) => setDniDevolucion(e.target.value)}
                          placeholder="Número de DNI"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Programa *</Label>
                        <SelectConBusqueda
                          label=""
                          searchEndpoint="/programas"
                          value={programaDevolucion}
                          onChange={setProgramaDevolucion}
                          placeholder="Buscar programa..."
                        />
                      </div>
                      <div>
                        <Label>Tipo de Devolución *</Label>
                        <select
                          value={tipoDevolucion}
                          onChange={(e) => setTipoDevolucion(e.target.value)}
                          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          required
                        >
                          <option value="">Seleccione...</option>
                          <option value="inscripcion">Derecho de Inscripción</option>
                          <option value="idiomas">Idiomas</option>
                          <option value="grados_titulos">Grados y Títulos</option>
                        </select>
                      </div>
                      <div>
                        <Label>Importe *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={importeDevolucion}
                          onChange={(e) => setImporteDevolucion(e.target.value)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Número de Voucher *</Label>
                        <Input
                          value={numeroVoucher}
                          onChange={(e) => setNumeroVoucher(e.target.value)}
                          placeholder="Número de voucher"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabPanel>
        </Card>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" size="lg" onClick={() => navigate('/expedientes')}>
            Cancelar
          </Button>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : id ? 'Actualizar' : 'Registrar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
