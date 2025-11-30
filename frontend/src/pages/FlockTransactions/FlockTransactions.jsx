import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import {
  ArrowUpFromLine,
  ArrowDownToLine,
  DollarSign,
  Clock,
  Plus,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { transactionAPI } from "~/apis/transaction.api";

import ExportFlockModal from "./ExportFlockModal/ExportFlockModal";

/* ============================================================
   UI COMPONENTS
============================================================ */

const KPICard = ({ icon: Icon, label, value, color, suffix = "" }) => (
  <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="text-white" size={22} />
    </div>
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-xl font-semibold">
        {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
        {suffix}
      </p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    "Đang xử lý": "bg-yellow-100 text-yellow-700",
    "Hoàn thành": "bg-green-100 text-green-700",
    "Đã hủy": "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
};

const PaymentBadge = ({ method }) => {
  const map = {
    "Tiền mặt": "bg-blue-100 text-blue-700",
    "Chuyển khoản": "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${map[method]}`}>
      {method}
    </span>
  );
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function FlockTransactions() {
  const now = new Date();

  const [activeTab, setActiveTab] = useState("export");
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // EXPORT STATES
  const [transactions, setTransactions] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [statsExport, setStatsExport] = useState({
    totalExport: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // IMPORT STATES (KHUNG SẴN – CHƯA CODE LOGIC)
  const [importTransactions, setImportTransactions] = useState([]);
  const [loadingImport, setLoadingImport] = useState(false);
  const [statsImport, setStatsImport] = useState({
    totalImport: 0,
    totalCost: 0,
    pendingOrders: 0,
  });

  /* ============================================================
     FETCH EXPORT DATA
  ============================================================ */
  const fetchExportData = async () => {
    setLoading(true);
    try {
      const res = await transactionAPI.getAll({
        type: "export",
        month: selectedMonth,
        year: selectedYear,
      });

      setTransactions(res.data.data.items || []);

      const statsRes = await transactionAPI.getStats({
        month: selectedMonth,
        year: selectedYear,
      });

      setStatsExport({
        totalExport: statsRes.data.data.totalExport,
        totalRevenue: statsRes.data.data.totalRevenue,
        pendingOrders: statsRes.data.data.pendingOrders,
      });
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu xuất chuồng!");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     FETCH IMPORT DATA (TODO – CHƯA DÙNG API)
  ============================================================ */
  const fetchImportData = async () => {
    // TODO: sau này gắn API thật ở đây
    // ví dụ:
    // setLoadingImport(true);
    // try {
    //   const res = await transactionAPI.getAll({ type: "import", month: selectedMonth, year: selectedYear });
    //   setImportTransactions(res.data.data.items || []);
    //   const statsRes = await transactionAPI.getStats({ month: selectedMonth, year: selectedYear });
    //   setStatsImport({
    //     totalImport: statsRes.data.data.totalImport,
    //     totalCost: statsRes.data.data.totalCost,
    //     pendingOrders: statsRes.data.data.pendingOrders,
    //   });
    // } catch (err) {
    //   toast.error("Không thể tải dữ liệu nhập chuồng!");
    // } finally {
    //   setLoadingImport(false);
    // }
  };

  /* ============================================================
     FETCH FLOCK LIST
  ============================================================ */
  const fetchFlocks = async () => {
    try {
      const res = await axios.get("http://localhost:8071/v1/flocks");
      setFlocks(res.data.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách đàn:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "export") {
      fetchExportData();
    } else if (activeTab === "import") {
      fetchImportData();
    }
  }, [activeTab, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchFlocks();
  }, []);

  /* ============================================================
     On Export Success
  ============================================================ */
  const handleExportSuccess = (newData) => {
    setTransactions((prev) => [newData, ...prev]);
    fetchExportData();
    fetchFlocks();
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("vi-VN");

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Nhập / Xuất chuồng</h1>
          <p className="text-gray-600">Quản lý giao dịch đàn</p>
        </div>

        <div className="flex gap-2">
          <select
            className="border rounded px-3 py-2"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger
              value="import"
              className="cursor-pointer px-4 py-2
              data-[state=active]:bg-blue-500 data-[state=active]:text-white
              hover:bg-blue-100 rounded-md transition"
            >
              Nhập chuồng
            </TabsTrigger>

            <TabsTrigger
              value="export"
              className="cursor-pointer px-4 py-2
              data-[state=active]:bg-green-500 data-[state=active]:text-white
              hover:bg-green-100 rounded-md transition ml-2"
            >
              Xuất chuồng
            </TabsTrigger>
          </TabsList>

          {activeTab === "export" && (
            <Button
              className="bg-green-500 hover:bg-green-600 text-white px-4 rounded-md"
              onClick={() => setIsExportModalOpen(true)}
            >
              <Plus size={16} className="mr-1" /> Xuất chuồng mới
            </Button>
          )}

          {activeTab === "import" && (
            <Button
              disabled
              className="bg-blue-400 text-white px-4 rounded-md opacity-60 cursor-not-allowed"
            >
              Đang phát triển
            </Button>
          )}
        </div>

        {/* ============================================================
            IMPORT TAB (KHUNG SẴN)
        ============================================================ */}
        <TabsContent value="import" className="mt-4">
          {/* KPI */}
          <div className="grid grid-cols-3 gap-4">
            <KPICard
              icon={ArrowDownToLine}
              label="Tổng nhập"
              value={statsImport.totalImport}
              color="bg-blue-500"
              suffix=" con"
            />
            <KPICard
              icon={DollarSign}
              label="Tổng chi phí"
              value={statsImport.totalCost}
              color="bg-indigo-500"
              suffix="₫"
            />
            <KPICard
              icon={Clock}
              label="Đơn chờ"
              value={statsImport.pendingOrders}
              color="bg-yellow-500"
            />
          </div>

          {/* TABLE SKELETON */}
          <div className="bg-white border rounded-lg overflow-hidden mt-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Ngày</th>
                  <th className="p-3 text-left">Đàn</th>
                  <th className="p-3 text-center">SL (con)</th>
                  <th className="p-3 text-center">TL TB</th>
                  <th className="p-3 text-left">Nhà cung cấp</th>
                  <th className="p-3 text-center">Thanh toán</th>
                  <th className="p-3 text-right">Tổng tiền</th>
                  <th className="p-3 text-center">Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {loadingImport ? (
                  <tr>
                    <td colSpan="8" className="p-4 text-center">
                      Đang tải dữ liệu nhập chuồng...
                    </td>
                  </tr>
                ) : importTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-gray-500">
                      Chức năng Nhập chuồng sẽ được cập nhật sau.
                    </td>
                  </tr>
                ) : (
                  importTransactions.map((t) => (
                    <tr key={t._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{formatDate(t.transactionDate)}</td>
                      <td className="p-3 font-medium">{t.flockCode}</td>
                      <td className="p-3 text-center">{t.quantity}</td>
                      <td className="p-3 text-center">{t.avgWeight} kg</td>
                      <td className="p-3">{t.supplierName}</td>
                      <td className="p-3 text-center">
                        <PaymentBadge method={t.paymentMethod} />
                      </td>
                      <td className="p-3 text-right">
                        {t.totalCost?.toLocaleString()}₫
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
            EXPORT TAB (ĐANG DÙNG)
        ============================================================ */}
        <TabsContent value="export" className="mt-4">
          {/* KPI */}
          <div className="grid grid-cols-3 gap-4">
            <KPICard
              icon={ArrowUpFromLine}
              label="Tổng xuất"
              value={statsExport.totalExport}
              color="bg-orange-500"
              suffix=" con"
            />
            <KPICard
              icon={DollarSign}
              label="Doanh thu"
              value={statsExport.totalRevenue}
              color="bg-green-500"
              suffix="₫"
            />
            <KPICard
              icon={Clock}
              label="Đơn chờ"
              value={statsExport.pendingOrders}
              color="bg-yellow-500"
            />
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
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="p-4 text-center">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-4 text-center">
                      Chưa có đơn xuất chuồng nào.
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
                        {t.pricePerKg?.toLocaleString()}₫
                      </td>
                      <td className="p-3">{t.customerName}</td>
                      <td className="p-3 text-center">
                        <PaymentBadge method={t.paymentMethod} />
                      </td>
                      <td className="p-3 text-right text-green-600 font-semibold">
                        {t.totalRevenue?.toLocaleString()}₫
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
