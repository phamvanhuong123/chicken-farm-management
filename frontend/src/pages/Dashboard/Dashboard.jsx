// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaChartPie,
  FaChartLine,
  FaDollarSign,
  FaExclamationTriangle,
  FaShoppingCart,
  FaTachometerAlt,
  FaRedo
} from 'react-icons/fa';
import { dashboardApi } from '../../apis/dashboardApi';
import KPICard from '../Dashboard/components/KPICard';
import FeedCard from '../Dashboard/components/FeedCard';
import PeriodFilter from '../Dashboard/components/PeriodFilter';
import DashboardAlert from '../Dashboard/components/DashboardAlert';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [kpiData, setKpiData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchKPIData = async (period) => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardApi.getDashboardKPIs(period);

      if (response && response.data && response.data.data) {
        setKpiData(response.data.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Error fetching KPI data:', err);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');

      // Fallback mock data (giống hình ảnh)
      setKpiData({
        totalChickens: {
          value: 12450,
          change: 4.2,
          status: 'up',
          unit: 'con',
          description: 'Tổng số gà đang nuôi',
          color: 'green'
        },
        // ... các dữ liệu mock khác
        period: period,
        calculatedAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      setAlertsLoading(true);
      const response = await dashboardApi.getDashboardAlerts();
      if (response.data && response.data.data) {
        setAlerts(response.data.data.alerts || []);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setAlertsLoading(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    fetchKPIData(period);
  };

  useEffect(() => {
    fetchKPIData(selectedPeriod);
    fetchAlerts();

    // Auto-refresh mỗi 5 phút
    const interval = setInterval(() => {
      fetchKPIData(selectedPeriod);
      fetchAlerts();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Function để lấy label cho period
  const getPeriodLabel = (period) => {
    const labels = {
      '24h': '24 giờ',
      '7d': '7 ngày',
      '30d': '30 ngày',
      '90d': '90 ngày',
      'all': 'Tất cả'
    };
    return labels[period] || period;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaTachometerAlt className="text-blue-600 text-2xl" />
              Tổng quan trang trại
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Theo dõi tình hình chung của trang trại gia cầm
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <PeriodFilter
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
              loading={loading}
            />

            {/* Nút làm mới */}
            <button
              onClick={() => {
                fetchKPIData(selectedPeriod);
                fetchAlerts();
              }}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaRedo className="w-4 h-4" />
              Làm mới
            </button>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <DashboardAlert
              alerts={alerts}
              loading={alertsLoading}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <FaExclamationTriangle />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* KPI Grid */}
        {loading && !kpiData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-40 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tổng số gà - Cột 1 */}
            <KPICard
              title="Tổng số gà"
              value={kpiData?.totalChickens?.value || 0}
              change={kpiData?.totalChickens?.change || 0}
              unit={kpiData?.totalChickens?.unit || 'con'}
              icon={<FaUsers className="text-2xl text-blue-600" />}
              color={kpiData?.totalChickens?.color}
              status={kpiData?.totalChickens?.status}
              description="Tổng số gà đang nuôi"
              loading={loading}
              iconBgColor="bg-blue-50"
            />

            {/* Trọng lượng TB - Cột 2 */}
            <KPICard
              title="Trọng lượng TB"
              value={kpiData?.avgWeight?.value || 0}
              change={kpiData?.avgWeight?.change || 0}
              unit={kpiData?.avgWeight?.unit || 'kg/con'}
              icon={<FaChartLine className="text-2xl text-teal-600" />}
              color={kpiData?.avgWeight?.color}
              status={kpiData?.avgWeight?.status}
              description="Trọng lượng trung bình"
              loading={loading}
              iconBgColor="bg-teal-50"
            />

            {/* Số đàn - Cột 3 */}
            <KPICard
              title="Số đàn"
              value={kpiData?.totalFlocks?.value || 0}
              change={kpiData?.totalFlocks?.change || 0}
              unit={kpiData?.totalFlocks?.unit || 'đàn'}
              icon={<FaChartPie className="text-2xl text-purple-600" />}
              color={kpiData?.totalFlocks?.color}
              status={kpiData?.totalFlocks?.status}
              description="Tổng số đàn đang nuôi"
              loading={loading}
              iconBgColor="bg-purple-50"
            />

            {/* Thức ăn hôm nay - Cột 4 */}
            <FeedCard
              title="Thức ăn hôm nay"
              value={kpiData?.todayFeed?.value || 0}
              unit={kpiData?.todayFeed?.unit || 'kg'}
              status={kpiData?.todayFeed?.status || 'normal'}
              label={kpiData?.todayFeed?.label || 'Bình thường'}
              color={kpiData?.todayFeed?.color || 'green'}
              loading={loading}
              icon={<FaShoppingCart className="text-2xl text-green-600" />}
              iconBgColor="bg-green-50"
            />

            {/* Tỷ lệ chết (7d) - Cột 5 */}
            <KPICard
              title="Tỷ lệ chết (7d)"
              value={kpiData?.deathRate?.value || 0}
              change={kpiData?.deathRate?.change || 0}
              unit={kpiData?.deathRate?.unit || '%'}
              icon={<FaExclamationTriangle className="text-2xl text-red-600" />}
              color={kpiData?.deathRate?.color}
              status={kpiData?.deathRate?.status}
              description="Tỷ lệ chết 7 ngày gần nhất"
              loading={loading}
              iconBgColor="bg-red-50"
              note={kpiData?.deathRate?.note}
            />

            {/* Doanh thu tháng - Cột 6 */}
            <KPICard
              title="Doanh thu tháng"
              value={kpiData?.monthlyRevenue?.value || 0}
              change={kpiData?.monthlyRevenue?.change || 0}
              unit={kpiData?.monthlyRevenue?.unit || 'VND'}
              icon={<FaDollarSign className="text-2xl text-green-600" />}
              color={kpiData?.monthlyRevenue?.color}
              status={kpiData?.monthlyRevenue?.status}
              description="Doanh thu tháng hiện tại"
              loading={loading}
              iconBgColor="bg-green-50"
              isCurrency={true}
            />
          </div>
        )}

        {/* Footer Info */}
        {kpiData && (
          <div className="mt-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2 mb-2 md:mb-0">
                <span className="font-medium">Khoảng thời gian đang xem:</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                  {getPeriodLabel(kpiData.period)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Dữ liệu cập nhật:</span>
                <span className="text-gray-700">
                  {new Date(kpiData.calculatedAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs text-gray-600">Tăng / Tốt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs text-gray-600">Giảm / Cần chú ý</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded"></div>
                <span className="text-xs text-gray-600">Không thay đổi</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;