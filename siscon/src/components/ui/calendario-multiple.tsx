import { useState } from 'react';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Label } from './label';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface CalendarioMultipleProps {
  label: string;
  selectedDates: string[];
  onChange: (dates: string[]) => void;
  className?: string;
  highlightWeekends?: boolean;
}

export function CalendarioMultiple({
  label,
  selectedDates,
  onChange,
  className,
}: CalendarioMultipleProps) {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 6]); // 0 = Domingo, 6 = Sábado

  const handleAddRange = () => {
    if (!startDate || !endDate) {
      toast.error('Por favor selecciona un rango de fechas');
      return;
    }

    const newDates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    // Normalizar a medianoche en hora local
    current.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
      const dayOfWeek = current.getDay();

      // Si no hay días seleccionados, agregar todas las fechas del rango
      // Si hay días seleccionados, solo agregar los que coincidan
      if (selectedDays.length === 0 || selectedDays.includes(dayOfWeek)) {
        // Formatear fecha manualmente para evitar problemas de zona horaria
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        if (!selectedDates.includes(dateString) && !newDates.includes(dateString)) {
          newDates.push(dateString);
        }
      }

      current.setDate(current.getDate() + 1);
    }

    if (newDates.length > 0) {
      onChange([...selectedDates, ...newDates].sort());
      setDateRange([null, null]);
      setSelectedDays([]);
    } else {
      toast.error('No se encontraron fechas en el rango seleccionado');
    }
  };



  const handleClearAll = () => {
    onChange([]);
  };

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const removeDate = (dateToRemove: string) => {
    onChange(selectedDates.filter(date => date !== dateToRemove));
  };





  const renderFechasInteractivas = (fechas: string[]) => {
    if (!fechas || fechas.length === 0) return null;

    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    // Agrupar fechas por mes y año
    const fechasPorMesAnio: Record<string, { year: number, month: number, days: { day: number, fullDate: string }[] }> = {};

    fechas.forEach(fecha => {
      const [year, month, day] = fecha.split('-').map(Number);
      const key = `${month - 1}-${year}`;

      if (!fechasPorMesAnio[key]) {
        fechasPorMesAnio[key] = { year, month: month - 1, days: [] };
      }
      fechasPorMesAnio[key].days.push({ day, fullDate: fecha });
    });

    const sortedKeys = Object.keys(fechasPorMesAnio).sort((a, b) => {
      const [m1, y1] = a.split('-').map(Number);
      const [m2, y2] = b.split('-').map(Number);
      return y1 !== y2 ? y1 - y2 : m1 - m2;
    });

    return (
      <div className="flex flex-wrap gap-x-1 gap-y-1 items-center">
        {sortedKeys.map((key, groupIndex) => {
          const group = fechasPorMesAnio[key];
          group.days.sort((a, b) => a.day - b.day);

          return (
            <span key={key}>
              {group.days.map((d, dayIndex) => (
                <span key={d.fullDate}>
                  <button
                    type="button"
                    onClick={() => removeDate(d.fullDate)}
                    className="hover:text-red-600 hover:bg-red-50 px-1 rounded transition-all cursor-pointer font-bold text-blue-600 underline decoration-dotted underline-offset-2"
                    title="Click para eliminar"
                  >
                    {d.day}
                  </button>
                  {dayIndex < group.days.length - 1 ? ', ' : ''}
                </span>
              ))}
              {` de ${meses[group.month]}`}
              {groupIndex < sortedKeys.length - 1 ? ', ' : ''}
            </span>
          );
        })}
      </div>
    );
  };

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-bold text-slate-700">{label}</Label>
      </div>

      <div className="border rounded-xl p-3 bg-white shadow-sm border-slate-200">
        {/* Fila Superior: DatePicker y Días */}
        <div className="flex flex-col md:flex-row gap-3 items-start">
          <div className="w-full md:w-1/2">
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update as [Date | null, Date | null])}
              placeholderText="Seleccionar rango..."
              dateFormat="dd/MM/yyyy"
              className="w-full text-sm h-9 px-3 border rounded-md focus:ring-1 focus:ring-blue-500 bg-slate-50"
              isClearable={true}
            />
          </div>

          <div className="w-full md:w-1/2 flex flex-wrap gap-1">
            {dayNames.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => toggleDay(index)}
                className={cn(
                  'h-9 flex-1 min-w-[35px] rounded text-[10px] font-bold transition-all border uppercase',
                  selectedDays.includes(index)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                )}
              >
                {day.substring(0, 2)} {/* Solo 2 letras para máximo ahorro de espacio */}
              </button>
            ))}
          </div>
        </div>

        {/* Botón de Acción Principal */}
        <Button
          type="button"
          onClick={handleAddRange}
          disabled={!startDate || !endDate}
          variant="secondary"
          size="sm"
          className="w-full text-blue-500 mt-3 h-8 text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border-none transition-all"
        >
          {selectedDays.length > 0 ? 'Agregar días filtrados' : 'Agregar todo el rango'}
        </Button>

        {/* Área de Resultado: Solo aparece si hay fechas */}
        {selectedDates.length > 0 && (
          <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
            {/* Cambiamos items-start por items-center */}
            <div className="flex items-center gap-3 group min-h-[40px]">
              <div className="flex-shrink-0 p-1.5 bg-blue-50 rounded-full">
                <span className="text-blue-600 text-xs block leading-none">📅</span>
              </div>

              <div className="flex-1">
                <div className="text-[13px] leading-tight text-slate-600 font-medium">
                  {renderFechasInteractivas(selectedDates)}
                </div>
              </div>

              <button
                onClick={handleClearAll}
                className="opacity-0 group-hover:opacity-100 text-[10px] text-red-500 font-bold hover:underline transition-opacity whitespace-nowrap ml-2"
              >
                BORRAR TODO
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
