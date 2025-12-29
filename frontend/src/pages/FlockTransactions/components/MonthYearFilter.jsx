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
      // Kiểm tra xem selectedMonth có phải chỉ là tháng (format: "MM") không
      if (/^\d{2}$/.test(selectedMonth)) {
        // Chỉ có tháng, không có năm
        setSelectedYear("");
        setSelectedMonthOnly(selectedMonth);
      } else if (/^\d{4}$/.test(selectedMonth)) {
        // Chỉ có năm (format: "YYYY")
        setSelectedYear(selectedMonth);
        setSelectedMonthOnly("");
      } else if (/^\d{4}-\d{2}$/.test(selectedMonth)) {
        // Có cả năm và tháng
        const [year, month] = selectedMonth.split('-');
        setSelectedYear(year);
        setSelectedMonthOnly(month);
      }
    } else {
      // Nếu không có selectedMonth (hiển thị tất cả), reset các select
      setSelectedYear("");
      setSelectedMonthOnly("");
    }
  }, [selectedMonth]);

  useEffect(() => {
    const months = [];
    // Thêm option "Tất cả tháng"
    months.push({
      value: "",
      label: "Tất cả tháng"
    });

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

    // Thêm option "Tất cả năm"
    years.push({
      value: "",
      label: "Tất cả năm"
    });

    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push({
        value: year.toString(),
        label: `Năm ${year}`
      });
    }

    setYearOptions(years);
  }, []);

  // Xử lý khi thay đổi năm hoặc tháng
  useEffect(() => {
    // Nếu không có tháng và không có năm -> hiển thị tất cả
    if (!selectedMonthOnly && !selectedYear) {
      onMonthChange("");
      return;
    }

    // Nếu có tháng nhưng không có năm -> chỉ lọc theo tháng (tất cả năm)
    if (selectedMonthOnly && !selectedYear) {
      onMonthChange(selectedMonthOnly); // Chỉ gửi tháng (format: "MM")
      return;
    }

    // Nếu có năm nhưng không có tháng -> chỉ lọc theo năm
    if (selectedYear && !selectedMonthOnly) {
      onMonthChange(selectedYear); // Chỉ gửi năm (format: "YYYY")
      return;
    }

    // Nếu có cả năm và tháng -> lọc theo năm-tháng
    if (selectedYear && selectedMonthOnly) {
      const newMonthYear = `${selectedYear}-${selectedMonthOnly}`;
      onMonthChange(newMonthYear);
    }
  }, [selectedYear, selectedMonthOnly, onMonthChange]);

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
          {yearOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={selectedMonthOnly}
          onChange={handleMonthChange}
          disabled={loading}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent min-w-[130px]"
        >
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