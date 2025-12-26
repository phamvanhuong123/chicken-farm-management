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
  FaRedo,
  FaChartBar,
} from 'react-icons/fa';
import { dashboardApi } from '../../apis/dashboardApi';
import KPICard from '../Dashboard/components/KPICard';
import FeedCard from '../Dashboard/components/FeedCard';
import PeriodFilter from '../Dashboard/components/PeriodFilter';
import DashboardAlert from '../Dashboard/components/DashboardAlert';
import WeeklyConsumptionChart from '../Dashboard/components/WeeklyConsumptionChart';
import CostStructureChart from '../Dashboard/components/CostStructureChart';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [kpiData, setKpiData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const processKPIData = (data, period) => {
    if (!data) return null;

    const processed = { ...data };

    if (processed.todayFeed) {
      const thresholds = processed.todayFeed.threshold || { LOW: 500, NORMAL: 800, HIGH: 1200 };
      const value = processed.todayFeed.value;
      const unit = processed.todayFeed.unit || 'kg';

      let status = 'normal';
      let label = 'Bình thường';
      let color = 'green';

      let displayValue = value;
      let displayUnit = unit;

      if (unit === 'lọ') {
        displayValue = value;
        displayUnit = 'kg';
      }

      if (displayValue <= thresholds.LOW) {
        status = 'low';
        label = 'Thiếu';
        color = 'red';
      } else if (displayValue >= thresholds.HIGH) {
        status = 'high';
        label = 'Dư thừa';
        color = 'orange';
      }

      processed.todayFeed = {
        ...processed.todayFeed,
        value: displayValue,
        unit: displayUnit,
        status: status,
        label: label,
        color: color
      };
    }

    if (processed.deathRate) {
      processed.deathRate = {
        ...processed.deathRate,
        description: `Tỷ lệ chết (${period === '7d' ? '7' : period === '30d' ? '30' : '90'} ngày gần nhất)`
      };
    }

    const otherKPIs = ['totalChickens', 'totalFlocks', 'avgWeight', 'monthlyRevenue'];
    otherKPIs.forEach(kpi => {
      if (processed[kpi]) {
        const change = processed[kpi].change || 0;
        let color = 'gray';
        let status = 'neutral';

        if (change > 0) {
          color = 'green';
          status = 'up';
        } else if (change < 0) {
          color = 'red';
          status = 'down';
        }

        processed[kpi] = {
          ...processed[kpi],
          color,
          status
        };
      }
    });

    return processed;
  };

  const fetchKPIData = async (period) => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardApi.getDashboardKPIs(period);

      if (response && response.data && response.data.data) {
        const processedData = processKPIData(response.data.data, period);
        setKpiData({
          ...processedData,
          period: period,
          calculatedAt: response.data.data.calculatedAt || new Date().toISOString()
        });
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Error fetching KPI data:', err);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');

      const mockData = {
        totalChickens: {
          value: 694,
          change: 42,
          unit: 'con',
          description: 'Tổng số gà đang nuôi (cập nhật trong 7d)',
          note: 'Dựa trên 6 đàn có cập nhật trong khoảng thời gian này'
        },
        totalFlocks: {
          value: 6,
          change: 0,
          unit: 'đàn',
          description: 'Tổng số đàn đang nuôi (cập nhật trong 7d)'
        },
        deathRate: {
          value: 0,
          change: -0.5,
          unit: '%',
          description: 'Tỷ lệ chết (7d gần nhất)',
          note: 'Không có dữ liệu kỳ trước để so sánh'
        },
        avgWeight: {
          value: 2.49,
          change: 42,
          unit: 'kg/con',
          description: 'Trọng lượng trung bình (cập nhật trong 7d)'
        },
        todayFeed: {
          value: 3075,
          change: 0,
          unit: 'lọ',
          status: 'high',
          label: 'Dư thừa',
          description: 'Thức ăn hôm nay',
          threshold: { LOW: 500, NORMAL: 800, HIGH: 1200 }
        },
        monthlyRevenue: {
          value: 245000000,
          change: 123,
          unit: 'VND',
          description: 'Doanh thu tháng này',
          formatted: '245.000.000 ₫'
        }
      };

      const processedMock = processKPIData(mockData, period);
      setKpiData({
        ...processedMock,
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

  const fetchChartsData = async () => {
    try {
      setChartsLoading(true);
      const response = await dashboardApi.getAllDashboardCharts();
      if (response.data && response.data.data) {
        setChartsData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching charts data:', err);
    } finally {
      setChartsLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchKPIData(selectedPeriod),
        fetchAlerts(),
        fetchChartsData()
      ]);
    } catch (err) {
      console.error('Error refreshing all data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    fetchKPIData(period);
  };

  useEffect(() => {
    handleRefreshAll();

    const interval = setInterval(() => {
      fetchKPIData(selectedPeriod);
      fetchAlerts();
      fetchChartsData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getPeriodLabel = (period) => {
    const labels = {
      '7d': '7 ngày',
      '30d': '30 ngày',
      '90d': '90 ngày'
    };
    return labels[period] || period;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaTachometerAlt className="text-blue-600 text-xl" />
              Tổng quan trang trại
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Theo dõi tình hình chung của trang trại gia cầm
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <PeriodFilter
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
              loading={loading}
            />

            <button
              onClick={handleRefreshAll}
              disabled={loading || refreshing}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              <FaRedo className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Đang làm mới...' : 'Làm mới'}
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
              <FaExclamationTriangle className="text-sm flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* KPI Grid */}
        {loading && !kpiData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Tổng số gà */}
            <KPICard
              title="Tổng số gà"
              value={kpiData?.totalChickens?.value || 0}
              change={kpiData?.totalChickens?.change || 0}
              unit={kpiData?.totalChickens?.unit || 'con'}
              icon={<FaUsers className="text-lg text-blue-600" />}
              color={kpiData?.totalChickens?.color}
              status={kpiData?.totalChickens?.status}
              description={kpiData?.totalChickens?.description || 'Tổng số gà đang nuôi'}
              loading={loading}
              iconBgColor="bg-blue-50"
              note={kpiData?.totalChickens?.note}
            />

            {/* Trọng lượng TB */}
            <KPICard
              title="Trọng lượng TB"
              value={kpiData?.avgWeight?.value || 0}
              change={kpiData?.avgWeight?.change || 0}
              unit={kpiData?.avgWeight?.unit || 'kg/con'}
              icon={<FaChartLine className="text-lg text-teal-600" />}
              color={kpiData?.avgWeight?.color}
              status={kpiData?.avgWeight?.status}
              description={kpiData?.avgWeight?.description || 'Trọng lượng trung bình'}
              loading={loading}
              iconBgColor="bg-teal-50"
            />

            {/* Số đàn */}
            <KPICard
              title="Số đàn"
              value={kpiData?.totalFlocks?.value || 0}
              change={kpiData?.totalFlocks?.change || 0}
              unit={kpiData?.totalFlocks?.unit || 'đàn'}
              icon={<FaChartPie className="text-lg text-purple-600" />}
              color={kpiData?.totalFlocks?.color}
              status={kpiData?.totalFlocks?.status}
              description={kpiData?.totalFlocks?.description || 'Tổng số đàn đang nuôi'}
              loading={loading}
              iconBgColor="bg-purple-50"
            />

            {/* Thức ăn hôm nay */}
            <FeedCard
              title="Thức ăn hôm nay"
              value={kpiData?.todayFeed?.value || 0}
              unit={kpiData?.todayFeed?.unit || 'kg'}
              status={kpiData?.todayFeed?.status || 'high'}
              label={kpiData?.todayFeed?.label || 'Dư thừa'}
              color={kpiData?.todayFeed?.color || 'orange'}
              loading={loading}
              icon={<FaShoppingCart className="text-lg text-orange-600" />}
              iconBgColor="bg-orange-50"
            />

            {/* Tỷ lệ chết */}
            <KPICard
              title="Tỷ lệ chết"
              value={kpiData?.deathRate?.value || 0}
              change={kpiData?.deathRate?.change || 0}
              unit={kpiData?.deathRate?.unit || '%'}
              icon={<FaExclamationTriangle className="text-lg text-red-600" />}
              color={kpiData?.deathRate?.color}
              status={kpiData?.deathRate?.status}
              description={kpiData?.deathRate?.description || 'Tỷ lệ chết'}
              loading={loading}
              iconBgColor="bg-red-50"
              note={kpiData?.deathRate?.note}
            />

            {/* Doanh thu tháng */}
            <KPICard
              title="Doanh thu tháng"
              value={kpiData?.monthlyRevenue?.value || 0}
              change={kpiData?.monthlyRevenue?.change || 0}
              unit={kpiData?.monthlyRevenue?.unit || 'VND'}
              icon={<FaDollarSign className="text-lg text-green-600" />}
              color={kpiData?.monthlyRevenue?.color}
              status={kpiData?.monthlyRevenue?.status}
              description={kpiData?.monthlyRevenue?.description || 'Doanh thu tháng hiện tại'}
              loading={loading}
              iconBgColor="bg-green-50"
              isCurrency={true}
            />
          </div>
        )}

        {/* Charts Section - U1.2 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaChartBar className="text-blue-600" />
                Biểu đồ tổng quan
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Thống kê và phân tích dữ liệu trang trại
              </p>
            </div>
            <button
              onClick={fetchChartsData}
              disabled={chartsLoading}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              <FaRedo className={`w-3 h-3 ${chartsLoading ? 'animate-spin' : ''}`} />
              {chartsLoading ? 'Đang tải...' : 'Làm mới biểu đồ'}
            </button>
          </div>

          {/* Charts in vertical layout */}
          <div className="space-y-6">
            {/* Biểu đồ tiêu thụ hàng tuần */}
            <div>
              <WeeklyConsumptionChart
                data={chartsData?.weeklyConsumption}
                loading={chartsLoading}
              />
            </div>

            {/* Biểu đồ cơ cấu chi phí */}
            <div>
              <CostStructureChart
                data={chartsData?.costStructure}
                loading={chartsLoading}
              />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        {kpiData && (
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-600">
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