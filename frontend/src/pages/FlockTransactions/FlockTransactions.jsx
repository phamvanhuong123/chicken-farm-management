// src/pages/FlockTransactions/FlockTransactions.jsx
import { useEffect, useState } from "react";
import { useImport } from "./hooks/useImport";
import { transactionAPI } from "../../apis/transaction.api";
import ImportTabs from "../../components/FlockTransactions/ImportTabs";
import ImportList from "../../components/FlockTransactions/ImportList";
import ImportForm from "../../components/FlockTransactions/ImportForm";
import ExportTransactions from "../../components/FlockTransactions/ExportFlockModal";
import DashboardKPI from "../../components/FlockTransactions/DashboardKPI";
import MonthYearFilter from "../../components/FlockTransactions/MonthYearFilter";
import Pagination from "../../components/FlockTransactions/Pagination";
import { flockApi } from "../../apis/flockApi";

function FlockTransactions() {
  const { imports, loadData, createImport, areaCurrentCounts } = useImport();
  const [showImportForm, setShowImportForm] = useState(false);
  const [showExportForm, setShowExportForm] = useState(false);
  const [tab, setTab] = useState("nhap");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [flocks, setFlocks] = useState([]);

  const [stats, setStats] = useState({
    totalImport: 0,
    totalExport: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN");

  /* ============================================================
      FETCH DATA
  ============================================================= */

  const fetchData = async () => {
    setLoading(true);
    try {
      const transRes = await transactionAPI.getAll({
        type: activeTab,
        month: selectedMonth,
        year: selectedYear,
      });

      setTransactions(transRes.data.data.items || []);

      const statsRes = await transactionAPI.getStats({
        month: selectedMonth,
        year: selectedYear,
      });

      setStats(statsRes.data.data || {});
    } catch (err) {
      toast.error("Lỗi tải dữ liệu");
    }
    setLoading(false);
  };

  const fetchFlocks = async () => {
    try {
      const res = await axios.get("http://localhost:8071/v1/flocks");
      setFlocks(res.data.data || []);
    } catch (err) {
      console.log("Lỗi tải đàn:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchFlocks();
  }, []);

  const handleExportSuccess = (newTrans) => {
    setTransactions((prev) => [newTrans, ...prev]);
    fetchData();
    fetchFlocks();
  };

  /* ============================================================
      RENDER
  ============================================================= */

  return (
    <div className="px-8 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Nhập / Xuất chuồng</h1>
        
        {/* Bộ lọc chung cho toàn trang */}
        <MonthYearFilter 
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          loading={loading}
        />
      </div>
      
      {/* DASHBOARD KPI */}
      <DashboardKPI selectedMonth={selectedMonth} />
      
      {/* TAB */}
      <ImportTabs tab={tab} setTab={setTab} />

      {/* TAB: XUẤT CHUỒNG */}
      {tab === "xuat" && (
        <>
          {/* BUTTON và thông tin */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Danh sách xuất chuồng</h2>
              <p className="text-sm text-gray-500">
                Quản lý các đơn xuất gia súc - Tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}
              </p>
              {/* Thêm thông tin số đàn đang nuôi */}
              <p className="text-sm text-blue-600 mt-1">
                Có {getActiveFlocks().length} đàn gà đang nuôi có thể xuất
              </p>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed w-fit"
              onClick={() => setShowExportForm(true)}
              disabled={loading || getActiveFlocks().length === 0}
            >
              <span>+</span>
              <span>Xuất chuồng mới</span>
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white border rounded-lg overflow-hidden mt-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Ngày</th>
                  <th className="p-3 text-left">Đàn</th>
                  <th className="p-3 text-center">SL</th>
                  <th className="p-3 text-center">TL TB</th>
                  <th className="p-3 text-left">Nhà cung cấp</th>
                  <th className="p-3 text-center">Thanh toán</th>
                  <th className="p-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pagedExports.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-8 px-4 text-center text-gray-500">
                      {loading ? "Đang tải dữ liệu..." : "Không có dữ liệu xuất chuồng trong tháng này"}
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{formatDate(t.transactionDate)}</td>
                      <td className="p-3 font-medium">{t.flockCode}</td>
                      <td className="p-3 text-center">{t.quantity}</td>
                      <td className="p-3 text-center">{t.avgWeight} kg</td>
                      <td className="p-3">{t.supplierName}</td>
                      <td className="p-3 text-center">
                        <PaymentBadge method={t.paymentMethod} />
                      </td>
                      <td className="p-3 text-center">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ============================================================
            EXPORT TAB
        ============================================================= */}
        <TabsContent value="export" className="mt-4">

          {/* KPI */}
          <div className="grid grid-cols-3 gap-4">
            <KPICard icon={ArrowUpFromLine} label="Tổng xuất" value={stats.totalExport} color="bg-orange-500" suffix=" con" />
            <KPICard icon={DollarSign} label="Doanh thu" value={stats.totalRevenue} color="bg-green-500" suffix="₫" />
            <KPICard icon={Clock} label="Đơn chờ" value={stats.pendingOrders} color="bg-yellow-500" />
          </div>

          {/* TABLE */}
          <div className="bg-white border rounded-lg overflow-hidden mt-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Ngày</th>
                  <th className="p-3 text-left">Đàn</th>
                  <th className="p-3 text-center">SL</th>
                  <th className="p-3 text-center">TL TB</th>
                  <th className="p-3 text-center">Giá/kg</th>
                  <th className="p-3 text-left">Khách hàng</th>
                  <th className="p-3 text-center">Thanh toán</th>
                  <th className="p-3 text-right">Doanh thu</th>
                  <th className="p-3 text-center">Trạng thái</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="p-4 text-center">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="p-4 text-center">
                      Chưa có dữ liệu xuất chuồng
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{formatDate(t.transactionDate)}</td>
                      <td className="p-3 font-medium">{t.flockCode}</td>
                      <td className="p-3 text-center">{t.quantity}</td>
                      <td className="p-3 text-center">{t.avgWeight} kg</td>
                      <td className="p-3 text-center">
                        {t.pricePerKg?.toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="p-3">{t.customerName}</td>
                      <td className="p-3 text-center">
                        <PaymentBadge method={t.paymentMethod} />
                      </td>
                      <td className="p-3 text-right text-green-600 font-semibold">
                        {t.totalRevenue?.toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="p-3 text-center">
                        <StatusBadge status={t.status} />
                      </td>

                      <td className="p-3 text-center">
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <Eye size={16} className="text-blue-500" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

      </Tabs>

      {/* EXPORT MODAL */}
      <ExportFlockModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        flocks={flocks}
        onExportSuccess={handleExportSuccess}
      />
    </div>
  );
}
