import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, RotateCcw } from 'lucide-react';

interface DatePickerCalendarProps {
  value: string;
  onChange: (dateStr: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const SWAHILI_MONTHS = [
  'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni',
  'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'
];

const WEEK_DAYS = ['Jt', 'Jn', 'Jt', 'Al', 'Ij', 'Jm', 'Jp']; // Mon to Sun

// Helper to parse 'DD/MM/YYYY' or 'YYYY-MM-DD' into Date
export const parseCustomDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
  } else if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
  }

  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
};

// Format Date object to DD/MM/YYYY string
export const formatToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Format Date object to YYYY-MM-DD for native input
export const formatToYYYYMMDD = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

export const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({
  value,
  onChange,
  label,
  placeholder = 'DD/MM/YYYY',
  className = '',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Internal date state for navigating calendar
  const initialDate = parseCustomDate(value);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-11
  
  const containerRef = useRef<HTMLDivElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  // Close calendar popup on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Update view month/year if value changes externally
  useEffect(() => {
    const d = parseCustomDate(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [value]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const selected = new Date(viewYear, viewMonth, day);
    onChange(formatToDDMMYYYY(selected));
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onChange(formatToDDMMYYYY(today));
    setIsOpen(false);
  };

  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    onChange(formatToDDMMYYYY(d));
    setIsOpen(false);
  };

  // Build calendar matrix
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const selectedDateObj = parseCustomDate(value);
  const isCurrentMonthSelected = 
    selectedDateObj.getFullYear() === viewYear && 
    selectedDateObj.getMonth() === viewMonth;
  const selectedDay = isCurrentMonthSelected ? selectedDateObj.getDate() : -1;

  const todayObj = new Date();
  const isCurrentMonthToday = 
    todayObj.getFullYear() === viewYear && 
    todayObj.getMonth() === viewMonth;
  const todayDay = isCurrentMonthToday ? todayObj.getDate() : -1;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-stone-300 font-bold flex items-center justify-between gap-1.5 text-xs mb-1.5">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[#F6BA35]" />
            {label}
          </span>
          <span className="text-[10px] text-[#F6BA35] font-normal cursor-pointer hover:underline" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? 'Funga Kalenda' : 'Fungua Kalenda'}
          </span>
        </label>
      )}

      {/* Input container with calendar icon trigger */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono text-xs focus:outline-none focus:border-[#F6BA35] transition-all cursor-pointer shadow-inner"
        />

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-1 top-1 bottom-1 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-[#F6BA35] border border-amber-400/20 hover:border-amber-400/50 flex items-center justify-center transition-all cursor-pointer"
          title="Fungua Kalenda ya Kuchagua Tarehe"
        >
          <CalendarIcon className="w-4 h-4 text-[#F6BA35]" />
        </button>

        {/* Hidden native picker fallback */}
        <input
          ref={nativeInputRef}
          type="date"
          tabIndex={-1}
          value={formatToYYYYMMDD(parseCustomDate(value))}
          onChange={(e) => {
            if (e.target.value) {
              const [y, m, d] = e.target.value.split('-');
              onChange(`${d}/${m}/${y}`);
            }
          }}
          className="sr-only"
        />
      </div>

      {/* Calendar Popup Dropdown Modal */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-72 sm:w-80 rounded-2xl bg-stone-900/95 backdrop-blur-xl border border-amber-500/40 shadow-2xl p-4 text-stone-100 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Month / Year controls */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer"
              title="Mwezi Uliopita"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#F6BA35] font-display">
                {SWAHILI_MONTHS[viewMonth]} {viewYear}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer"
              title="Mwezi Ujao"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEK_DAYS.map((w, idx) => (
              <span key={idx} className="text-[11px] font-bold text-stone-400 py-1">
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Trailing days from previous month */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => {
              const prevDayNum = daysInPrevMonth - firstDayIndex + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="h-8 flex items-center justify-center text-[11px] text-stone-600 select-none"
                >
                  {prevDayNum}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isSelected = dayNum === selectedDay;
              const isToday = dayNum === todayDay;

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#F6BA35] text-stone-950 font-black shadow-[0_0_12px_rgba(246,186,53,0.6)] scale-105 z-10'
                      : isToday
                      ? 'bg-amber-500/15 text-[#F6BA35] border border-amber-400/50 hover:bg-[#F6BA35] hover:text-stone-950 font-bold'
                      : 'text-stone-200 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  {dayNum}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#F6BA35]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Preset Action Buttons */}
          <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSetToday}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[#F6BA35] border border-amber-400/30 font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3 h-3 stroke-[2.5]" />
                Leo
              </button>
              <button
                type="button"
                onClick={handleSetYesterday}
                className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium transition-all cursor-pointer"
              >
                Jana
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium transition-all cursor-pointer"
            >
              Funga
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
