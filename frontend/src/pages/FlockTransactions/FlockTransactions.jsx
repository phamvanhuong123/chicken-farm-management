import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  DollarSign,
  Clock,
  Plus,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { transactionAPI } from "~/apis/transaction.api";

import ExportFlockModal from "./ExportFlockModal/ExportFlockModal";

/* ============================================================
   UI COMPONENTS
============================================================ */

const KPICard = ({ icon: Icon, label, value, color, suffix = "" }) => (
  <div className="bg-white shadow rounded-lg p-4 flex items-center gap-3">
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="text-white" size={24} />
    </div>
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold">
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
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        map[status] || "bg-gray-100"
      }`}
    >
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
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        map[method] || "bg-gray-100"
      }`}
    >
      {method}
    </span>
  );
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function FlockTransactions() {
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

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

  const fetchData = async () => {
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

      setStats(statsRes.data.data || {});
    } catch (err) {
      toast.error("Không thể tải dữ liệu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlocks = async () => {
    try {
      const res = await axios.get("http://localhost:8071/v1/flocks");
      setFlocks(res.data.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách đàn:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchFlocks();
  }, []);

  const handleExportSuccess = (newTransaction) => {
    setTransactions((prev) => [newTransaction, ...prev]);
    fetchData();
    fetchFlocks();
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN");

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${i + 1}`,
  }));

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* PAGE HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Xuất chuồng</h1>
          <p className="text-gray-600 text-sm">Quản lý giao dịch xuất đàn</p>
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          icon={ArrowDownToLine}
          label="Tổng nhập"
          value={stats.totalImport}
          color="bg-blue-500"
          suffix=" con"
        />
        <KPICard
          icon={ArrowUpFromLine}
          label="Tổng xuất"
          value={stats.totalExport}
          color="bg-orange-500"
          suffix=" con"
        />
        <KPICard
          icon={DollarSign}
          label="Doanh thu"
          value={stats.totalRevenue}
          color="bg-green-500"
          suffix="₫"
        />
        <KPICard
          icon={Clock}
          label="Đơn chờ xử lý"
          value={stats.pendingOrders}
          color="bg-yellow-500"
        />
      </div>

      {/* HEADER + BUTTON */}
      <div className="flex justify-between items-center mt-4">
        <h2 className="text-lg font-semibold">Danh sách xuất chuồng</h2>

        <Button
          onClick={() => setIsExportModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 cursor-pointer"
        >
          <Plus size={16} className="mr-1" />
          Xuất chuồng mới
        </Button>
      </div>

      {/* EXPORT TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden mt-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Ngày</th>
              <th className="p-3 text-left">Đàn</th>
              <th className="p-3 text-center">SL (con)</th>
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
                <td colSpan="9" className="text-center p-4">
                  Đang tải...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center p-4 text-gray-500">
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
                  <td className="p-3 text-right text-green-600 font-bold">
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
