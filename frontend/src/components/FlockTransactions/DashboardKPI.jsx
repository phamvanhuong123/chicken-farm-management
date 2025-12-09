import { useState, useEffect } from "react";
import { importApi } from "../../apis/importApi";
import { transactionAPI } from "../../apis/transaction.api";

const parseDateFromImport = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    if (typeof dateValue === 'object' && dateValue.$date) {
      return new Date(dateValue.$date);
    }
    if (typeof dateValue === 'string') {
      return new Date(dateValue);
    }
    if (dateValue instanceof Date) {
      return dateValue;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export default function DashboardKPI({ selectedMonth }) {
  const [dashboardData, setDashboardData] = useState({
    totalImport: 0,
    totalExport: 0,
    revenue: 0,
    pendingOrders: 0
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedMonth) {
      loadDashboardData();
    }
  }, [selectedMonth]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split('-');
      const targetYear = parseInt(year);
      const targetMonth = parseInt(month);
      
      const importResponse = await importApi.getList();
      const allImports = importResponse.data.data?.items || [];
      
      const filteredImports = allImports.filter(imp => {
        const importDate = parseDateFromImport(imp.importDate);
        if (!importDate || isNaN(importDate.getTime())) return false;
        
        const importYear = importDate.getFullYear();
        const importMonth = importDate.getMonth() + 1;
        
        return importYear === targetYear && importMonth === targetMonth;
      });
      
      const totalImport = filteredImports.reduce((sum, imp) => {
        return sum + (Number(imp.quantity) || 0);
      }, 0);

      const exportResponse = await transactionAPI.getAll();
      const allExports = exportResponse.data.data?.items || [];
      
      const filteredExports = allExports.filter(exp => {
        const transactionDate = parseDateFromImport(exp.transactionDate || exp.exportDate);
        if (!transactionDate || isNaN(transactionDate.getTime())) return false;
        
        const exportYear = transactionDate.getFullYear();
        const exportMonth = transactionDate.getMonth() + 1;
        
        return exportYear === targetYear && exportMonth === targetMonth;
      });
      
      const totalExport = filteredExports.reduce((sum, exp) => {
        return sum + (Number(exp.quantity) || 0);
      }, 0);

      const revenue = filteredExports.reduce((sum, exp) => {
        const quantity = Number(exp.quantity) || 0;
        const avgWeight = Number(exp.avgWeight) || 0;
        const pricePerKg = Number(exp.pricePerKg) || 0;
        return sum + (quantity * avgWeight * pricePerKg);
      }, 0);

      const pendingOrders = filteredExports.filter(exp => {
        const status = exp.status?.toLowerCase();
        return status === 'pending' || status === 'đang xử lý' || status === 'chờ xử lý';
      }).length;

      setDashboardData({
        totalImport,
        totalExport,
        revenue,
        pendingOrders
      });

    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('vi-VN').format(number);
  };

  const getCurrentMonthLabel = () => {
    const [year, month] = selectedMonth.split('-');
    return `Tháng ${month}/${year}`;
  };

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Tổng quan tháng</h2>
        <p className="text-sm text-gray-500 mt-1">
          Thống kê nhập/xuất chuồng {getCurrentMonthLabel()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng nhập tháng</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {loading ? (
                  <span className="inline-block w-16 h-8 bg-gray-200 rounded animate-pulse"></span>
                ) : (
                  formatNumber(dashboardData.totalImport)
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">Số lượng gà nhập chuồng</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng xuất tháng</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {loading ? (
                  <span className="inline-block w-16 h-8 bg-gray-200 rounded animate-pulse"></span>
                ) : (
                  formatNumber(dashboardData.totalExport)
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">Số lượng gà xuất chuồng</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Doanh thu tháng</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {loading ? (
                  <span className="inline-block w-24 h-8 bg-gray-200 rounded animate-pulse"></span>
                ) : (
                  formatCurrency(dashboardData.revenue)
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">Từ việc xuất chuồng</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đơn chờ xử lý</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {loading ? (
                  <span className="inline-block w-16 h-8 bg-gray-200 rounded animate-pulse"></span>
                ) : (
                  formatNumber(dashboardData.pendingOrders)
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">Đơn xuất chưa xử lý</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Tỷ lệ xuất/nhập</p>
              <p className="text-lg font-bold text-blue-900 mt-1">
                {loading ? (
                  <span className="inline-block w-12 h-6 bg-blue-200 rounded animate-pulse"></span>
                ) : dashboardData.totalImport > 0 ? (
                  `${((dashboardData.totalExport / dashboardData.totalImport) * 100).toFixed(1)}%`
                ) : (
                  '0%'
                )}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Doanh thu trung bình</p>
              <p className="text-lg font-bold text-green-900 mt-1">
                {loading ? (
                  <span className="inline-block w-20 h-6 bg-green-200 rounded animate-pulse"></span>
                ) : dashboardData.totalExport > 0 ? (
                  formatCurrency(dashboardData.revenue / dashboardData.totalExport)
                ) : (
                  formatCurrency(0)
                )}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Tỷ lệ chờ xử lý</p>
              <p className="text-lg font-bold text-yellow-900 mt-1">
                {loading ? (
                  <span className="inline-block w-12 h-6 bg-yellow-200 rounded animate-pulse"></span>
                ) : dashboardData.totalExport > 0 ? (
                  `${((dashboardData.pendingOrders / dashboardData.totalExport) * 100).toFixed(1)}%`
                ) : (
                  '0%'
                )}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}