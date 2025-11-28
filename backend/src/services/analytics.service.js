/**
 * TEAM-122 
 * Quản lý KPI Dashboard:
 *  - Tổng nhập tháng
 *  - Tổng xuất tháng
 *  - Doanh thu tháng
 */

import { GET_DB } from "~/config/mongodb.js";

const COLLECTION = "analytics";

export const analyticsService = {
  async updateMonthlyImport(quantity) {
    const db = GET_DB();
    const monthKey = getMonthKey();

    await db.collection(COLLECTION).updateOne(
      { month: monthKey },
      { $inc: { totalImport: quantity } },
      { upsert: true }
    );

    console.log(
      `[Analytics] Updated totalImport +${quantity} for month ${monthKey}`
    );
  },

  async updateMonthlyExport(quantity) {
    const db = GET_DB();
    const monthKey = getMonthKey();

    await db.collection(COLLECTION).updateOne(
      { month: monthKey },
      { $inc: { totalExport: quantity } },
      { upsert: true }
    );

    console.log(
      `[Analytics] Updated totalExport +${quantity} for month ${monthKey}`
    );
  },

  async updateMonthlyRevenue(amount) {
    const db = GET_DB();
    const monthKey = getMonthKey();

    await db.collection(COLLECTION).updateOne(
      { month: monthKey },
      { $inc: { revenue: amount } },
      { upsert: true }
    );

    console.log(
      `[Analytics] Updated revenue +${amount} for month ${monthKey}`
    );
  },

  /**
   * Lấy KPI dashboard
   */
  async getDashboardData() {
    const db = GET_DB();
    const monthKey = getMonthKey();

    const data = await db.collection(COLLECTION).findOne({
      month: monthKey,
    });

    return (
      data || {
        month: monthKey,
        totalImport: 0,
        totalExport: 0,
        revenue: 0,
      }
    );
  },
};

function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
