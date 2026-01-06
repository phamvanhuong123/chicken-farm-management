import React, { useState, useEffect, useCallback } from "react";
import { financeApi } from "~/apis/financeApi";
import toast from "react-hot-toast";
import {
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Eye,
  Trash2,
  Plus,
  Search,
  RotateCcw,
} from "lucide-react";
import Chart from "react-apexcharts";
import FinanceCreateForm from "./components/FinanceCreateForm";

export default function Finance() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [trend, setTrend] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Filter tháng
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear] = useState(currentDate.getFullYear());

  // Filters cho bảng giao dịch
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    search: "",
  });

  // Load dữ liệu tổng quan
  useEffect(() => {
    loadOverviewData();
  }, [selectedMonth]);

  // Load transactions khi page thay đổi
  useEffect(() => {
    loadRecentTransactions();
  }, [filters, currentPage]);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      const [overviewRes, breakdownRes, trendRes] = await Promise.all([
        financeApi.getOverview(selectedMonth, selectedYear),
        financeApi.getExpenseBreakdown(selectedMonth, selectedYear),
        financeApi.getTrend(6, selectedYear),
      ]);

      setOverview(overviewRes.data.data);
      setExpenseBreakdown(breakdownRes.data.data);
      setTrend(trendRes.data.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      toast.error("Không thể tải dữ liệu tài chính");
    } finally {
      setLoading(false);
    }
  };

  // Load giao dịch gần đây
  const ITEMS_PER_PAGE = 10;

  const loadRecentTransactions = async () => {
    try {
      const response = await financeApi.getRecentTransactions(1000);
      let data = response.data.data || [];

      // FILTER
      if (filters.type !== "all") {
        data = data.filter((t) => t.type === filters.type);
      }

      if (filters.category !== "all") {
        data = data.filter((t) => t.category === filters.category);
      }

      if (filters.search) {
        const keyword = filters.search.toLowerCase();
        data = data.filter((t) =>
          t.description?.toLowerCase().includes(keyword)
        );
      }

      setTotalTransactions(data.length);

      const pages = Math.ceil(data.length / ITEMS_PER_PAGE);
      setTotalPages(pages || 1);

      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      setTransactions(data.slice(startIndex, startIndex + ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Lỗi tải giao dịch:", error);
      toast.error("Không thể tải danh sách giao dịch");
    }
  };

  // Debounce search
  const [searchDebounce, setSearchDebounce] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchDebounce }));
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchDebounce]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({ type: "all", category: "all", search: "" });
    setSearchDebounce("");
    setCurrentPage(1);
  };

  // Change filter
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Format tiền VND
  const formatCurrency = (value) => {
    if (!value) return "0 VND";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Format ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Xóa giao dịch
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa giao dịch này?")) return;

    try {
      await financeApi.deleteTransaction(id);
      toast.success("Đã xóa giao dịch");
      loadOverviewData(); // Reload overview
      loadRecentTransactions(); // Reload transactions
    } catch (error) {
      toast.error("Không thể xóa giao dịch");
    }
  };

  // Xem chi tiết giao dịch
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  // Config biểu đồ xu hướng (Line Chart)
  const trendChartOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#10b981", "#ef4444"],
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: trend.map((t) => t.monthLabel),
      title: { text: "Tháng" },
    },
    yaxis: {
      title: { text: "Số tiền (VND)" },
      labels: {
        formatter: (value) => {
          return (value / 1000000).toFixed(0) + "M";
        },
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
    },
    tooltip: {
      y: {
        formatter: (value) => formatCurrency(value),
      },
    },
  };

  const trendChartSeries = [
    {
      name: "Thu nhập",
      data: trend.map((t) => t.income),
    },
    {
      name: "Chi phí",
      data: trend.map((t) => t.expense),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Chưa có giao dịch nào được ghi nhận.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Chi phí & Tài chính
          </h1>
          <p className="text-gray-600">
            Tổng quan tài chính và giao dịch gần đây
          </p>
        </div>

        {/* Nút thêm giao dịch */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Thêm giao dịch
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Tổng thu */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng thu</p>
              <p className="text-2xl font-bold text-green-600">
                {(overview.totalIncome / 1000000).toFixed(0)}M
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tổng chi */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng chi</p>
              <p className="text-2xl font-bold text-red-600">
                {(overview.totalExpense / 1000000).toFixed(0)}M
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Lợi nhuận */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Lợi nhuận</p>
              <p className="text-2xl font-bold text-blue-600">
                +{(overview.profit / 1000000).toFixed(0)}M
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <CircleDollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Tỷ suất lợi nhuận */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tỷ suất lợi nhuận</p>
              <p className="text-2xl font-bold text-purple-600">
                {overview.profitMargin}%
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Percent className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 2 Columns: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Cơ cấu chi phí */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Cơ cấu chi phí (Tháng này)
            </h2>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="border rounded px-3 py-1.5 text-sm"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
          </div>

          {expenseBreakdown.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-4">
              {expenseBreakdown.map((item, index) => {
                const colors = {
                  "Thức ăn": "bg-blue-500",
                  Thuốc: "bg-purple-500",
                  "Nhân công": "bg-orange-500",
                  "Điện nước": "bg-yellow-500",
                };
                const color = colors[item.category] || "bg-gray-500";

                return (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        {item.category}
                      </span>
                      <span className="text-sm font-medium">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Xu hướng tài chính */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Xu hướng tài chính</h2>
          {trend.length > 0 ? (
            <Chart
              options={trendChartOptions}
              series={trendChartSeries}
              type="line"
              height={320}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
          )}
        </div>
      </div>

      {/* Bảng giao dịch gần đây */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Giao dịch gần đây</h2>
            <div className="text-sm text-gray-600">
              Tổng: {totalTransactions} giao dịch
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filter Loại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả loại</option>
                <option value="income">Thu</option>
                <option value="expense">Chi</option>
              </select>
            </div>

            {/* Filter Danh mục */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả danh mục</option>
                <option value="Thức ăn">Thức ăn</option>
                <option value="Thuốc">Thuốc</option>
                <option value="Nhân công">Nhân công</option>
                <option value="Điện nước">Điện nước</option>
                <option value="Bán hàng">Bán hàng</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Mô tả hoặc hóa đơn..."
                  value={searchDebounce}
                  onChange={(e) => setSearchDebounce(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không có giao dịch phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Đàn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hóa đơn
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.type === "income" ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Thu
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                          Chi
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <span
                        className={
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transaction.flockCode || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {transaction.description || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transaction.invoiceCode || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewTransaction(transaction)}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteTransaction(transaction._id)
                          }
                          className="p-2 hover:bg-red-50 rounded"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Trang {currentPage} / {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal thêm giao dịch */}
      {showCreateModal && (
        <FinanceCreateForm
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setCurrentPage(1); // quay về trang 1
            loadOverviewData();
            loadRecentTransactions();
            setShowCreateModal(false);
          }}
        />
      )}
      {/* Modal xem chi tiết giao dịch */}
      {showViewModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-[600px] max-h-[90vh] overflow-y-auto p-6 shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Chi tiết giao dịch
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTransaction(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Transaction Details */}
            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Ngày giao dịch</p>
                  <p className="font-medium">
                    {formatDate(selectedTransaction.date)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Loại giao dịch</p>
                  <p className="font-medium">
                    {selectedTransaction.type === "income" ? (
                      <span className="text-green-600">Thu nhập</span>
                    ) : (
                      <span className="text-red-600">Chi phí</span>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Danh mục</p>
                  <p className="font-medium">{selectedTransaction.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Số tiền</p>
                  <p className="font-medium text-lg">
                    <span
                      className={
                        selectedTransaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {selectedTransaction.type === "income" ? "+" : "-"}
                      {formatCurrency(selectedTransaction.amount)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Thông tin đàn liên quan */}
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Đàn liên quan</p>
                <p className="font-medium">
                  {selectedTransaction.flockCode || "Không có"}
                </p>
              </div>

              {/* Số hóa đơn */}
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Số hóa đơn / Mã giao dịch</p>
                <p className="font-medium">
                  {selectedTransaction.invoiceCode || "Không có"}
                </p>
              </div>

              {/* Mô tả chi tiết */}
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Mô tả chi tiết</p>
                <div className="p-4 bg-gray-50 rounded-lg border min-h-[80px]">
                  <p className="whitespace-pre-wrap">
                    {selectedTransaction.description || "Không có mô tả"}
                  </p>
                </div>
              </div>

              {/* Thông tin thêm */}
              <div className="pt-4 border-t">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>ID: {selectedTransaction._id}</p>
                  <p>
                    Ngày tạo:{" "}
                    {new Date(selectedTransaction.createdAt).toLocaleString("vi-VN")}
                  </p>
                  {selectedTransaction.updatedAt && (
                    <p>
                      Cập nhật lần cuối:{" "}
                      {new Date(selectedTransaction.updatedAt).toLocaleString("vi-VN")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTransaction(null);
                }}
                className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
