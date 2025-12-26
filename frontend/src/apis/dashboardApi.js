// src/apis/dashboardApi.js
import axios from '~/apis/index';


export const dashboardApi = {
    // U1.1: Lấy KPI Dashboard với bộ lọc thời gian
    getDashboardKPIs(period = '7d') {
        return axios.get(`/dashboard/summary?period=${period}`);
    },

    // U1.2: Lấy dữ liệu biểu đồ xu hướng
    getDashboardTrend(period = '30d', chartType = 'weight') {
        return axios.get(`/dashboard/trend?period=${period}&chartType=${chartType}`);
    },

    // Lấy cảnh báo dashboard
    getDashboardAlerts() {
        return axios.get(`/dashboard/alerts`);
    },

    // Lấy dữ liệu biểu đồ tiêu thụ hàng tuần (U1.2)
    getWeeklyConsumptionChart() {
        return axios.get(`/dashboard/charts/weekly-consumption`);
    },

    // Lấy dữ liệu biểu đồ cơ cấu chi phí (U1.2)
    getCostStructureChart() {
        return axios.get(`/dashboard/charts/cost-structure`);
    },

    // Lấy tất cả dữ liệu biểu đồ (U1.2)
    getAllDashboardCharts() {
        return axios.get(`/dashboard/charts/all`);
    },

    // Health check API
    checkApiStatus() {
        return axios.get(`/dashboard/status`);
    }
};