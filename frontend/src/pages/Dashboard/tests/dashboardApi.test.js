import { dashboardApi } from '../../../apis/dashboardApi';
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock axios instance từ module ~/apis/index
vi.mock('~/apis/index', () => {
    return {
        default: {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() }
            }
        }
    };
});

import axiosInstance from '~/apis/index';

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

        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getDashboardKPIs();

        expect(axiosInstance.get).toHaveBeenCalledWith(`/dashboard/summary?period=7d`);
        expect(result).toEqual(mockResponse);
    });

    test('TC2 - Gọi getDashboardKPIs với period tùy chỉnh', async () => {
        const mockResponse = {
            data: {
                message: 'Success',
                data: { period: '30d' }
            }
        };

        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getDashboardKPIs('30d');

        expect(axiosInstance.get).toHaveBeenCalledWith(`/dashboard/summary?period=30d`);
        expect(result).toEqual(mockResponse);
    });

    test('TC3 - Gọi getDashboardTrend với params', async () => {
        const mockResponse = {
            data: {
                message: 'Success',
                data: { chartType: 'weight' }
            }
        };

        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getDashboardTrend('30d', 'weight');

        expect(axiosInstance.get).toHaveBeenCalledWith(
            `/dashboard/trend?period=30d&chartType=weight`
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

        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getDashboardAlerts();

        expect(axiosInstance.get).toHaveBeenCalledWith(`/dashboard/alerts`);
        expect(result).toEqual(mockResponse);
    });

    test('TC5 - Gọi getWeeklyConsumptionChart', async () => {
        const mockResponse = {
            data: {
                message: 'Success',
                data: { chartType: 'stacked_column' }
            }
        };

        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getWeeklyConsumptionChart();

        expect(axiosInstance.get).toHaveBeenCalledWith(
            `/dashboard/charts/weekly-consumption`
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

        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getCostStructureChart();

        expect(axiosInstance.get).toHaveBeenCalledWith(
            `/dashboard/charts/cost-structure`
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

        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.getAllDashboardCharts();

        expect(axiosInstance.get).toHaveBeenCalledWith(`/dashboard/charts/all`);
        expect(result).toEqual(mockResponse);
    });

    test('TC8 - Gọi checkApiStatus', async () => {
        const mockResponse = {
            data: {
                status: 'active',
                version: '1.0'
            }
        };

        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await dashboardApi.checkApiStatus();

        expect(axiosInstance.get).toHaveBeenCalledWith(`/dashboard/status`);
        expect(result).toEqual(mockResponse);
    });

    test('TC9 - Xử lý lỗi khi gọi API', async () => {
        const error = new Error('Network Error');
        axiosInstance.get.mockRejectedValue(error);

        await expect(dashboardApi.getDashboardKPIs()).rejects.toThrow('Network Error');
    });
});