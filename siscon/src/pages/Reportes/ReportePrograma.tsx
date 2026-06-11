import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  Download,
  Loader2,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Calendar,
} from 'lucide-react';

interface Programa {
  id: number;
  nombre: string;
  periodo: string;
  grado?: { id: number; nombre: string };
  facultad?: { id: number; nombre: string };
}

export default function ReportePrograma() {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [periodos, setPeriodos] = useState<string[]>([]);
  const [selectedPrograma, setSelectedPrograma] = useState<string>('');
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [programasRes] = await Promise.all([
        axios.get('/programas'),
      ]);
      const programasList: Programa[] = programasRes.data.data || programasRes.data;
      setProgramas(programasList);

      // Extract unique periods
      const periodosSet = new Set<string>();
      programasList.forEach((p: Programa) => {
        if (p.periodo) periodosSet.add(p.periodo);
      });
      const sortedPeriodos = Array.from(periodosSet).sort().reverse();
      setPeriodos(sortedPeriodos);

      // Default to most recent period
      if (sortedPeriodos.length > 0) {
        setSelectedPeriodo(sortedPeriodos[0]);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter programs by selected period
  const filteredProgramas = selectedPeriodo
    ? programas.filter(p => p.periodo === selectedPeriodo)
    : programas;

  const handleExport = async () => {
    if (!selectedPrograma) {
      toast.error('Selecciona un programa');
      return;
    }

    setIsExporting(true);
    try {
      const params: Record<string, string> = {
        programa_id: selectedPrograma,
      };
      if (selectedPeriodo) {
        params.periodo = selectedPeriodo;
      }

      const response = await axios.get('/reportes/programa', {
        params,
        responseType: 'blob',
      });

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `Reporte_Programa_${new Date().toISOString().split('T')[0]}.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?([^;\n]*)/i);
        if (match && match[1]) {
          fileName = decodeURIComponent(match[1].replace(/['"]/g, ''));
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error al generar reporte:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedProgramaData = programas.find(p => String(p.id) === selectedPrograma);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-slate-500 text-sm">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reportes</h1>
          <p className="text-sm text-slate-500">Genera reportes en Excel por programa</p>
        </div>
      </div>

      {/* Report Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-white/90" />
            <div>
              <h2 className="text-lg font-semibold text-white">Reporte por Programa</h2>
              <p className="text-sm text-white/70">
                Genera un reporte Excel con semestres, cursos, docentes y montos de pago
              </p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6">
          {/* Filters Section */}
          <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-600">Filtros del Reporte</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Period Selector */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Periodo
                </label>
                <Select
                  value={selectedPeriodo}
                  onValueChange={(value) => {
                    setSelectedPeriodo(value);
                    setSelectedPrograma(''); // Reset program when period changes
                  }}
                >
                  <SelectTrigger id="periodo-select" className="bg-white">
                    <SelectValue placeholder="Seleccionar periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__todos__">Todos los periodos</SelectItem>
                    {periodos.map((periodo) => (
                      <SelectItem key={periodo} value={periodo}>
                        {periodo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Program Selector */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <GraduationCap className="h-4 w-4 text-purple-500" />
                  Programa
                </label>
                <Select
                  value={selectedPrograma}
                  onValueChange={setSelectedPrograma}
                >
                  <SelectTrigger id="programa-select" className="bg-white">
                    <SelectValue placeholder="Seleccionar programa" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProgramas.map((programa) => (
                      <SelectItem key={programa.id} value={String(programa.id)}>
                        {programa.grado?.nombre ? `${programa.grado.nombre} en ` : ''}
                        {programa.nombre}
                        {programa.periodo ? ` (${programa.periodo})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preview Info */}
          {selectedProgramaData && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-800 mb-3">Vista Previa del Reporte</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-blue-600 min-w-[80px]">Programa:</span>
                  <span className="text-sm text-slate-700">
                    {selectedProgramaData.grado?.nombre ? `${selectedProgramaData.grado.nombre} en ` : ''}
                    {selectedProgramaData.nombre}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-blue-600 min-w-[80px]">Periodo:</span>
                  <span className="text-sm text-slate-700">
                    {selectedPeriodo && selectedPeriodo !== '__todos__' ? selectedPeriodo : 'Todos'}
                  </span>
                </div>
                {selectedProgramaData.facultad && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-blue-600 min-w-[80px]">Facultad:</span>
                    <span className="text-sm text-slate-700">{selectedProgramaData.facultad.nombre}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200/50">
                <p className="text-xs text-blue-600/70">
                  El reporte incluirá: Semestre, Curso, Docente, Total Horas, Costo Hora, Monto Total y EsSalud 9%
                </p>
              </div>
            </div>
          )}

          {/* Export Button */}
          <div className="flex justify-end pt-2">
            <Button
              id="btn-generar-reporte"
              onClick={handleExport}
              disabled={!selectedPrograma || isExporting}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 px-6 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/40 disabled:opacity-50 disabled:shadow-none"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generar Reporte Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-xl border border-slate-200/60 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Información del Reporte</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Semestres', desc: 'Agrupados por 1°, 2°, 3°, 4°', color: 'blue' },
            { label: 'Cursos', desc: 'Nombre de cada curso', color: 'purple' },
            { label: 'Docentes', desc: 'Con título profesional', color: 'emerald' },
            { label: 'Pagos', desc: 'Horas, costo y montos', color: 'amber' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-100"
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 bg-${item.color}-500`} />
              <div>
                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
