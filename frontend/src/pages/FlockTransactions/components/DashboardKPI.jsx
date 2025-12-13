import { useMemo } from "react";

export default function DashboardKPI({
  imports = [],
  exports = [],
  selectedMonth
}) {
  const dashboardData = useMemo(() => {
    // ===== TỔNG NHẬP =====
    const totalImport = imports.reduce(
      (sum, i) => sum + Number(i.quantity || 0),
      0
    );

    // ===== XUẤT =====
    const totalExportOrders = exports.length;

    const completedExports = exports.filter(
      (e) => e.status === "Hoàn thành"
    );

    const totalExport = completedExports.reduce(
      (sum, e) => sum + Number(e.quantity || 0),
      0
    );

    const revenue = completedExports.reduce(
      (sum, e) =>
        sum +
        Number(e.quantity || 0) *
          Number(e.avgWeight || 0) *
          Number(e.pricePerKg || 0),
      0
    );

    const pendingOrders = exports.filter((e) =>
      ["đang xử lý", "chờ xử lý"].includes(e.status?.toLowerCase())
    ).length;

    return {
      totalImport,
      totalExport,
      revenue,
      pendingOrders,
      totalExportOrders
    };
  }, [imports, exports]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);

  const formatNumber = (number) =>
    new Intl.NumberFormat("vi-VN").format(number);

  const getCurrentMonthLabel = () => {
    const [year, month] = selectedMonth.split("-");
    return `Tháng ${month}/${year}`;
  };

  /* =======================
     ⛔ UI GIỮ NGUYÊN 100%
     ======================= */
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Tổng quan tháng</h2>
        <p className="text-sm text-gray-500 mt-1">
          Thống kê nhập/xuất chuồng {getCurrentMonthLabel()}
        </p>
      </div>

      {/* ===== KPI CHÍNH ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tổng nhập */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng nhập tháng</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatNumber(dashboardData.totalImport)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Số lượng gà nhập chuồng
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tổng xuất */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng xuất tháng</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatNumber(dashboardData.totalExport)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Số lượng gà xuất chuồng
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 12H4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Doanh thu */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Doanh thu tháng</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(dashboardData.revenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Từ việc xuất chuồng
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2
                     3 .895 3 2-1.343 2-3 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Đơn chờ */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đơn chờ xử lý</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {dashboardData.pendingOrders}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Đơn xuất chưa xử lý
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
