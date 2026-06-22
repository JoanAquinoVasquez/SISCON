import { useState, useEffect, useRef } from 'react';
import axios from '../../lib/axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabPanel } from '../../components/ui/tabs';
import {
  BarChart3,
  Download,
  Loader2,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Calendar,
  ChevronDown,
  Search,
  Check,
} from 'lucide-react';

interface Programa {
  id: number;
  nombre: string;
  periodo: string;
  grado?: { id: number; nombre: string };
  facultad?: { id: number; nombre: string };
}

interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  icon?: React.ReactNode;
}

function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = 'Buscar...',
  icon,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        {icon}
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 hover:bg-slate-50 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-left shadow-sm"
      >
        <span className={selectedOption ? 'text-slate-800 font-medium truncate' : 'text-slate-400 truncate'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/80 overflow-hidden animate-in fade-in duration-100">
          {/* Search Input */}
          <div className="relative border-b border-slate-100">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2.5 text-sm border-0 focus:ring-0 text-slate-800 placeholder-slate-400 focus:outline-none bg-slate-50/50"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">
                No se encontraron resultados
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors duration-150 ${
                      isSelected
                        ? 'bg-blue-50/70 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const MESES = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const currentYear = new Date().getFullYear();
const ANOS = Array.from({ length: 6 }, (_, i) => {
  const y = currentYear - 3 + i;
  return { value: String(y), label: String(y) };
});

export default function ReportePrograma() {
  const [activeTab, setActiveTab] = useState('programa');
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [periodos, setPeriodos] = useState<string[]>([]);
  const [selectedPrograma, setSelectedPrograma] = useState<string>('');
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  
  // Fourth Category States
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingCuarta, setIsExportingCuarta] = useState(false);

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

  const handleExportCuarta = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error('Selecciona mes y año');
      return;
    }

    setIsExportingCuarta(true);
    try {
      const response = await axios.get('/reportes/prestador-cuarta-categoria', {
        params: {
          month: selectedMonth,
          year: selectedYear,
        },
        responseType: 'blob',
      });

      const contentDisposition = response.headers['content-disposition'];
      let fileName = `Reporte_Cuarta_Categoria_${selectedYear}_${selectedMonth}.xlsx`;
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

      toast.success('Reporte de cuarta categoría generado exitosamente');
    } catch (error) {
      console.error('Error al generar reporte de cuarta categoría:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setIsExportingCuarta(false);
    }
  };

  const selectedProgramaData = programas.find(p => String(p.id) === selectedPrograma);

  const reportTabs = [
    { id: 'programa', label: 'Reporte por Programa', icon: '🎓' },
    { id: 'cuarta-categoria', label: 'Prestadores de Cuarta Categoría', icon: '💼' }
  ];

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
          <p className="text-sm text-slate-500">Genera y exporta reportes del sistema</p>
        </div>
      </div>

      {/* Report Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-white/90" />
            <div>
              <h2 className="text-lg font-semibold text-white">Reportes SISCON</h2>
              <p className="text-sm text-white/70">
                Genera reportes detallados en formato Excel
              </p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <Tabs tabs={reportTabs} activeTab={activeTab} onChange={setActiveTab} />

          <TabPanel id="programa" activeTab={activeTab}>
            <div className="space-y-6">
              {/* Filters Section */}
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600">Filtros del Reporte</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Period Selector */}
                  <SearchableSelect
                    label="Periodo"
                    placeholder="Seleccionar periodo"
                    searchPlaceholder="Buscar periodo..."
                    icon={<Calendar className="h-4 w-4 text-blue-500" />}
                    value={selectedPeriodo}
                    onChange={(value) => {
                      setSelectedPeriodo(value);
                      setSelectedPrograma(''); // Reset program when period changes
                    }}
                    options={[
                      { value: '__todos__', label: 'Todos los periodos' },
                      ...periodos.map((p) => ({ value: p, label: p })),
                    ]}
                  />

                  {/* Program Selector */}
                  <SearchableSelect
                    label="Programa"
                    placeholder="Seleccionar programa"
                    searchPlaceholder="Buscar programa por nombre o grado..."
                    icon={<GraduationCap className="h-4 w-4 text-purple-500" />}
                    value={selectedPrograma}
                    onChange={setSelectedPrograma}
                    options={filteredProgramas.map((p) => ({
                      value: String(p.id),
                      label: `${p.grado?.nombre ? `${p.grado.nombre} en ` : ''}${p.nombre}${p.periodo ? ` (${p.periodo})` : ''}`,
                    }))}
                  />
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
          </TabPanel>

          <TabPanel id="cuarta-categoria" activeTab={activeTab}>
            <div className="space-y-6">
              {/* Filters Section */}
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600">Filtros de Búsqueda</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Month Selector */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Mes de Pago
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 hover:bg-slate-50 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                    >
                      {MESES.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Selector */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      Año de Pago
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 hover:bg-slate-50 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                    >
                      {ANOS.map((y) => (
                        <option key={y.value} value={y.value}>
                          {y.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Info/Preview */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
                <h3 className="text-sm font-semibold text-purple-800 mb-3">Información del Reporte de Cuarta Categoría</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>
                    Este reporte exporta todos los prestadores de servicios de cuarta categoría (docentes externos) que registran una **Fecha de Constancia de Pago** en el mes y año seleccionados.
                  </p>
                  <p className="text-xs text-purple-600/70 pt-2 border-t border-purple-200/50">
                    Columnas incluidas: Tipo Doc. (1), DNI, RUC, Apellidos y Nombres (en mayúsculas), Fecha de Nacimiento, Sexo (1: H, 2: F) y Nacionalidad (9589).
                  </p>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex justify-end pt-2">
                <Button
                  id="btn-generar-reporte-cuarta"
                  onClick={handleExportCuarta}
                  disabled={isExportingCuarta}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 px-6 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/40 disabled:opacity-50 disabled:shadow-none"
                >
                  {isExportingCuarta ? (
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
          </TabPanel>
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
