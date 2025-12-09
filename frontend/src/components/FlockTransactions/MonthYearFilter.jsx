import { useState, useEffect } from "react";

export default function MonthYearFilter({ 
  selectedMonth, 
  onMonthChange,
  loading = false,
  showLabel = true 
}) {
  const [monthOptions, setMonthOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonthOnly, setSelectedMonthOnly] = useState("");

  useEffect(() => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      setSelectedYear(year);
      setSelectedMonthOnly(month);
    }
  }, [selectedMonth]);

  useEffect(() => {
    const months = [];
    for (let i = 1; i <= 12; i++) {
      const month = String(i).padStart(2, '0');
      months.push({ 
        value: month, 
        label: `Tháng ${i}` 
      });
    }
    setMonthOptions(months);
  }, []);

  useEffect(() => {
    const years = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push({ 
        value: year.toString(), 
        label: `Năm ${year}` 
      });
    }
    
    setYearOptions(years);
    
    if (!selectedYear) {
      setSelectedYear(currentYear.toString());
    }
  }, []);

  useEffect(() => {
    if (selectedYear && selectedMonthOnly) {
      const newMonthYear = `${selectedYear}-${selectedMonthOnly}`;
      if (newMonthYear !== selectedMonth) {
        onMonthChange(newMonthYear);
      }
    }
  }, [selectedYear, selectedMonthOnly]);

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonthOnly(e.target.value);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {showLabel && (
        <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Lọc theo:
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        <select
          value={selectedYear}
          onChange={handleYearChange}
          disabled={loading}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent min-w-[120px]"
        >
          <option value="">Chọn năm</option>
          {yearOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={selectedMonthOnly}
          onChange={handleMonthChange}
          disabled={loading || !selectedYear}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent min-w-[130px]"
        >
          <option value="">Chọn tháng</option>
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center text-sm text-gray-500">
          <svg className="animate-spin h-4 w-4 mr-2 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Đang tải...
        </div>
      )}
    </div>
  );
}