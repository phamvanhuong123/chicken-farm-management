import { useState } from "react";
import {
  ArrowUpFromLine,
  ArrowDownToLine,
  DollarSign,
  Clock,
  Eye,
  Printer,
  Plus
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";

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
        {value}
        {suffix}
      </p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    "Đang xử lý": "bg-yellow-100 text-yellow-700",
    "Hoàn thành": "bg-green-100 text-green-700",
    "Đã hủy": "bg-red-100 text-red-700"
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
    "Chuyển khoản": "bg-purple-100 text-purple-700"
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

  const loading = false;

  const statsImport = {
    totalImport: 0,
    totalRevenue: 0,
    pendingOrders: 0
  };

  const statsExport = {
    totalExport: 0,
    totalRevenue: 0,
    pendingOrders: 0
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN");

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* PAGE HEADER */}
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

        {/* TAB LIST + BUTTON */}
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="export" className="cursor-pointer px-4 py-2
                data-[state=active]:bg-green-500 data-[state=active]:text-white
                hover:bg-green-100 transition-all duration-150 rounded-md"
            >
            Xuất chuồng
          </TabsTrigger>
          </TabsList>

          {activeTab === "export" && (
            <Button className="bg-green-500 hover:bg-green-600 text-white px-4 
                transition-all duration-150 shadow-sm hover:shadow cursor-pointer rounded-md"
            >
            <Plus size={16} className="mr-1" /> Xuất chuồng mới
            </Button>
          )}
        </div>

        {/* ============================================================== */}
        {/* EXPORT TAB */}
        {/* ============================================================== */}
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
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
            </table>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
