import { useState } from 'react';
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
  highlightWeekends = true,
}: CalendarioMultipleProps) {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 6]); // 0 = Domingo, 6 = Sábado

  const handleAddRange = () => {
    if (!startDate || !endDate) {
      alert('Por favor selecciona un rango de fechas');
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
      alert('No se encontraron fechas en el rango seleccionado');
    }
  };

  const handleRemoveDate = (dateToRemove: string) => {
    onChange(selectedDates.filter(date => date !== dateToRemove));
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

  const getDayOfWeek = (dateString: string): number => {
    // Parse date in local timezone to avoid offset issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getDay();
  };

  const isWeekend = (dateString: string): boolean => {
    const day = getDayOfWeek(dateString);
    return day === 0 || day === 6;
  };

  const formatDate = (dateString: string): string => {
    // Parse date in local timezone to avoid offset issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className={cn('space-y-4', className)}>
      <Label>{label}</Label>
      
      {/* Selector de rango con días específicos (opcional) */}
      <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <p className="text-sm font-medium text-blue-800 mb-3">📅 Seleccionar fechas</p>
        
        <div className="mb-3">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
              setDateRange(update as [Date | null, Date | null]);
            }}
            placeholderText="Selecciona un rango de fechas"
            dateFormat="dd/MM/yyyy"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            isClearable={true}
            monthsShown={2}
          />
        </div>

        <div className="mb-3">
          <Label className="text-xs mb-2 block text-gray-700">
            Días específicos (opcional - deja vacío para agregar todos los días del rango)
          </Label>
          <div className="flex flex-wrap gap-2">
            {dayNames.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => toggleDay(index)}
                className={cn(
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  selectedDays.includes(index)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                )}
              >
                {day}
              </button>
            ))}
          </div>
          {selectedDays.length > 0 && (
            <p className="text-xs text-blue-600 mt-2">
              ✓ Se agregarán solo: {selectedDays.map(d => dayNames[d]).join(', ')}
            </p>
          )}
          {selectedDays.length === 0 && startDate && endDate && (
            <p className="text-xs text-gray-500 mt-2">
              ℹ️ Se agregarán todos los días del rango
            </p>
          )}
        </div>

        <Button
          type="button"
          onClick={handleAddRange}
          disabled={!startDate || !endDate}
          size="sm"
          className="w-full"
        >
          {selectedDays.length > 0 
            ? `Agregar ${selectedDays.map(d => dayNames[d]).join(', ')}`
            : 'Agregar Rango Completo'
          }
        </Button>
      </div>

      {/* Fechas seleccionadas */}
      {selectedDates.length > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-gray-700">
              Fechas seleccionadas ({selectedDates.length})
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Limpiar todo
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
            {selectedDates.map((date) => (
              <div
                key={date}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm',
                  highlightWeekends && isWeekend(date)
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-800 border border-gray-300'
                )}
              >
                <span>{formatDate(date)}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDate(date)}
                  className="text-gray-500 hover:text-gray-700 font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
