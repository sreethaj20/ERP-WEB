// src/utils/holidays.js
// Central holiday registry and helpers

// Helper to format a Date to YYYY-MM-DD in local time
const fmt = (d) => {
  const dd = new Date(d);
  const y = dd.getFullYear();
  const m = String(dd.getMonth() + 1).padStart(2, '0');
  const day = String(dd.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Declared holidays (local YYYY-MM-DD)
export const HOLIDAYS = [
  { date: '2025-06-07', name: 'Bakrid/Eid ul-Adha' },
  { date: '2025-08-09', name: 'Raksha Bandhan (Rakhi)' },
  { date: '2025-08-15', name: 'Independence Day' },
  { date: '2025-10-02', name: 'Mahatma Gandhi Jayanti' },
  { date: '2025-10-20', name: 'Diwali/Deepavali' },
  { date: '2025-12-25', name: 'Christmas' },
  { date: '2026-01-01', name: 'New Year' },
  { date: '2026-01-26', name: 'Republic Day' },
  { date: '2026-01-19',	name: 'Martin Luther King Jr. Day'},
  { date: '2026-02-16', name: "Presidents’ Day" },
  { date: '2026-03-03', name: 'Badi Holi / Holika Dahan' },
  { date: '2026-05-25', name: 'Memorial Day' },
  { date: '2026-06-19', name: 'Juneteenth' },
  { date: '2026-07-03', name: 'Independence Day (Observed)' },
  { date: '2026-08-15', name: 'Independence Day (India)' },
  { date: '2026-09-07', name: 'Labor Day' },
  { date: '2026-10-02', name: 'Gandhi Jayanti' },
  { date: '2026-10-12', name: 'Columbus Day' },
  { date: '2026-10-20', name: 'Dussehra / Vijaya Dashami' },
  { date: '2026-11-08', name: 'Diwali' },
  { date: '2026-11-11', name: 'Veterans Day' },
  { date: '2026-11-26', name: 'Thanksgiving Day' },
  { date: '2026-12-25', name: 'Christmas Day (US)' }
];

export const isHoliday = (dateInput) => {
  try {
    const ds = typeof dateInput === 'string' && dateInput.length === 10
      ? dateInput
      : fmt(dateInput);
    return HOLIDAYS.some(h => h.date === ds);
  } catch {
    return false;
  }
};

export const getHolidaysForMonth = (year, monthIndex /* 0-based */) => {
  const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  return HOLIDAYS.filter(h => h.date.startsWith(key));
};

export default {
  HOLIDAYS,
  isHoliday,
  getHolidaysForMonth,
};
