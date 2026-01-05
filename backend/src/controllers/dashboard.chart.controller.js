import { dashboardService } from "../services/dashboard.service.js";

/**
 * Controller xử lý API biểu đồ dashboard (U1.2)
 */
export const dashboardChartController = {
    /**
     * Lấy dữ liệu biểu đồ tiêu thụ hàng tuần
     */
    async getWeeklyConsumption(req, res) {
        try {
            const data = await dashboardService.getWeeklyConsumptionChart();
            res.json({
                success: true,
                data,
                message: "Lấy dữ liệu tiêu thụ hàng tuần thành công"
            });
        } catch (error) {
            console.error("Get weekly consumption error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy dữ liệu tiêu thụ hàng tuần",
                error: error.message
            });
        }
    },

    /**
     * Lấy dữ liệu biểu đồ cơ cấu chi phí
     */
    async getCostStructure(req, res) {
        try {
            const data = await dashboardService.getCostStructureChart();
            res.json({
                success: true,
                data,
                message: "Lấy dữ liệu cơ cấu chi phí thành công"
            });
        } catch (error) {
            console.error("Get cost structure error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy dữ liệu cơ cấu chi phí",
                error: error.message
            });
        }
    },

    /**
     * Lấy tất cả dữ liệu biểu đồ (tổng hợp)
     */
    async getAllCharts(req, res) {
        try {
            const data = await dashboardService.getDashboardCharts();
            res.json({
                success: true,
                data,
                message: "Lấy tất cả dữ liệu biểu đồ thành công"
            });
        } catch (error) {
            console.error("Get all charts error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy dữ liệu biểu đồ",
                error: error.message
            });
        }
    }
};