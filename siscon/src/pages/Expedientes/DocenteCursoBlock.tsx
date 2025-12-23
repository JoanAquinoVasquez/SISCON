import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SelectConBusqueda } from '@/components/ui/select-con-busqueda';
import { CalendarioMultiple } from '@/components/ui/calendario-multiple';
import { X } from 'lucide-react';

interface DocenteCursoBlockProps {
  index: number;
  docente: any;
  curso: any;
  fechasEnsenanza: any[];
  numeroOficioCoordinador: string;
  tipoAsunto: 'presentacion' | 'conformidad';
  onDocenteChange: (value: any) => void;
  onCursoChange: (value: any) => void;
  onFechasChange: (value: any[]) => void;
  onOficioChange: (value: string) => void;
  onRemove?: () => void;
  showRemove: boolean;
}

export default function DocenteCursoBlock({
  index,
  docente,
  curso,
  fechasEnsenanza,
  numeroOficioCoordinador,
  tipoAsunto,
  onDocenteChange,
  onCursoChange,
  onFechasChange,
  onOficioChange,
  onRemove,
  showRemove
}: DocenteCursoBlockProps) {
  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200 relative">
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar docente-curso"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      
      <h4 className="text-lg font-semibold text-gray-700 mb-4">
        Docente y Curso {index > 0 ? `#${index + 1}` : ''}
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Docente *</Label>
          <SelectConBusqueda
            label=""
            searchEndpoint="/pagos-docentes/buscar-docente"
            value={docente}
            onChange={onDocenteChange}
            placeholder="Buscar docente..."
          />
        </div>
        
        <div>
          <Label>Curso *</Label>
          <SelectConBusqueda
            label=""
            searchEndpoint="/pagos-docentes/buscar-curso"
            value={curso}
            onChange={onCursoChange}
            placeholder="Buscar curso..."
          />
        </div>
        
        <div>
          <Label>
            N° Oficio {tipoAsunto === 'presentacion' ? 'Presentación' : 'Conformidad'} Coordinador (Opcional)
          </Label>
          <Input
            value={numeroOficioCoordinador}
            onChange={(e) => onOficioChange(e.target.value)}
            placeholder={tipoAsunto === 'presentacion' ? 'Ej: OF-COORD-001-2025' : 'Ej: OF-CONF-COORD-001-2025'}
          />
        </div>
        
        <div className="md:col-span-2">
          <CalendarioMultiple
            label="Fechas de Enseñanza"
            selectedDates={fechasEnsenanza}
            onChange={onFechasChange}
          />
        </div>
      </div>
    </div>
  );
}
