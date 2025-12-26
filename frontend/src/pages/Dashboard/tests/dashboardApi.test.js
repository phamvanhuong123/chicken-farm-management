import { dashboardApi } from '../../../apis/dashboardApi';
import axios from 'axios';
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock axios
vi.mock('axios');

describe('U1.1 - Dashboard API Module', () => {
    const API_BASE_URL = 'http://localhost:8071/v1';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('TC1 - Gọi getDashboardKPIs với period mặc định', async () => {
        const mockResponse = {
            data: {
                message: 'Success',
                data: { period: '7d' }
            }
        };

        axios.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getDashboardKPIs();

        expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/dashboard/summary?period=7d`);
        expect(result).toEqual(mockResponse);
    });

    test('TC2 - Gọi getDashboardKPIs với period tùy chỉnh', async () => {
        const mockResponse = {
            data: {
                message: 'Success',
                data: { period: '30d' }
            }
        };

        axios.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getDashboardKPIs('30d');

        expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/dashboard/summary?period=30d`);
        expect(result).toEqual(mockResponse);
    });

    test('TC3 - Gọi getDashboardTrend với params', async () => {
        const mockResponse = {
            data: {
                message: 'Success',
                data: { chartType: 'weight' }
            }
        };

        axios.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getDashboardTrend('30d', 'weight');

        expect(axios.get).toHaveBeenCalledWith(
            `${API_BASE_URL}/dashboard/trend?period=30d&chartType=weight`
        );
        expect(result).toEqual(mockResponse);
    });

    test('TC4 - Gọi getDashboardAlerts', async () => {
        const mockResponse = {
            data: {
                message: 'Success',
                data: { alerts: [] }
            }
        };

        axios.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getDashboardAlerts();

        expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/dashboard/alerts`);
        expect(result).toEqual(mockResponse);
    });

    test('TC5 - Gọi getWeeklyConsumptionChart', async () => {
        const mockResponse = {
            data: {
                message: 'Success',
                data: { chartType: 'stacked_column' }
            }
        };

        axios.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getWeeklyConsumptionChart();

        expect(axios.get).toHaveBeenCalledWith(
            `${API_BASE_URL}/dashboard/charts/weekly-consumption`
        );
        expect(result).toEqual(mockResponse);
    });

    test('TC6 - Gọi getCostStructureChart', async () => {
        const mockResponse = {
            data: {
                message: 'Success',
                data: { chartType: 'cost_structure' }
            }
        };

        axios.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getCostStructureChart();

        expect(axios.get).toHaveBeenCalledWith(
            `${API_BASE_URL}/dashboard/charts/cost-structure`
        );
        expect(result).toEqual(mockResponse);
    });

    test('TC7 - Gọi getAllDashboardCharts', async () => {
        const mockResponse = {
            data: {
                message: 'Success',
                data: { weeklyConsumption: {}, costStructure: {} }
            }
        };

        axios.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getAllDashboardCharts();

        expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/dashboard/charts/all`);
        expect(result).toEqual(mockResponse);
    });

    test('TC8 - Gọi checkApiStatus', async () => {
        const mockResponse = {
            data: {
                status: 'active',
                version: '1.0'
            }
        };

        axios.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.checkApiStatus();

        expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/dashboard/status`);
        expect(result).toEqual(mockResponse);
    });

    test('TC9 - Xử lý lỗi khi gọi API', async () => {
        const error = new Error('Network Error');
        axios.get.mockRejectedValue(error);

        await expect(dashboardApi.getDashboardKPIs()).rejects.toThrow('Network Error');
    });
});