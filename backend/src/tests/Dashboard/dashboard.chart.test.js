import { dashboardService } from "../../services/dashboard.service.js";

describe("Dashboard Chart Service (U1.2)", () => {
    describe("Biểu đồ Tiêu thụ hàng tuần", () => {
        it("nên trả về dữ liệu biểu đồ stacked column", async () => {
            const data = await dashboardService.getWeeklyConsumptionChart();

            expect(data.chartType).toBe("stacked_column");
            expect(data.title).toBe("Tiêu thụ hàng tuần");
            expect(Array.isArray(data.data)).toBe(true);
            expect(data.data.length).toBe(7);

            // Kiểm tra các ngày trong tuần
            const days = data.data.map(item => item.day);
            expect(days).toEqual(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']);

            // Kiểm tra series
            expect(data.series).toHaveLength(2);
            expect(data.series[0].name).toBe("Thức ăn");
            expect(data.series[0].color).toBe("#4CAF50");
            expect(data.series[1].name).toBe("Thuốc & Vaccine");
            expect(data.series[1].color).toBe("#FF9800");
        });
    });

    describe("Biểu đồ Cơ cấu chi phí", () => {
        it("nên trả về dữ liệu biểu đồ phân bổ chi phí", async () => {
            const data = await dashboardService.getCostStructureChart();

            expect(data.chartType).toBe("cost_structure");
            expect(data.title).toBe("Cơ cấu chi phí");
            expect(Array.isArray(data.data)).toBe(true);
            expect(data.data.length).toBe(4);

            // Kiểm tra các danh mục
            const categories = data.data.map(item => item.category);
            expect(categories).toContain("Thức ăn");
            expect(categories).toContain("Thuốc & Vaccine");
            expect(categories).toContain("Nhân công");
            expect(categories).toContain("Điện nước & Khác");

            // Kiểm tra tổng chi phí
            expect(data.total).toHaveProperty("value");
            expect(data.total).toHaveProperty("formatted");
            expect(data.total.formatted).toContain("₫");

            // Kiểm tra tổng phần trăm = 100%
            const totalPercentage = data.data.reduce((sum, item) => sum + item.percentage, 0);
            expect(totalPercentage).toBe(100);
        });
    });

    describe("Lấy tất cả biểu đồ", () => {
        it("nên trả về cả 2 biểu đồ cùng lúc", async () => {
            const data = await dashboardService.getDashboardCharts();

            expect(data).toHaveProperty("weeklyConsumption");
            expect(data).toHaveProperty("costStructure");
            expect(data.weeklyConsumption.chartType).toBe("stacked_column");
            expect(data.costStructure.chartType).toBe("cost_structure");
        });
    });
});