import React from "react";
import Chart from "react-apexcharts";

function StatisticalArea({ overview }) {
  if (!overview) return null;

  const kpi = overview.kpis;
  const chart = overview.employeeDistribution;

  return (
    <>
      <div className="grid grid-cols-5 gap-4 mb-6">
        <KPI title="Tổng số khu" value={kpi.totalAreas} />
        <KPI title="Đang hoạt động" value={kpi.activeAreas} color="green" />
        <KPI title="Đang trống" value={kpi.emptyAreas} color="blue" />
        <KPI title="Bảo trì" value={kpi.maintenanceAreas} color="orange" />
        <KPI title="Có sự cố" value={kpi.incidentAreas} color="red" />
      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium mb-4">Phân bổ nhân viên theo khu</h3>

        <Chart
          type="bar"
          height={300}
          series={[
            {
              name: "Nhân viên",
              data: chart.map((c) => c.staffCount),
            },
          ]}
          options={{
            xaxis: {
              categories: chart.map((c) => c.name),
            },
            colors: ["#3b82f6"],
          }}
        />
      </div>
    </>
  );
}

function KPI({ title, value, color = "gray" }) {
  const bg = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-700",
  }[color];

  return (
    <div className={`p-4 bg-white shadow rounded-lg ${bg}`}>
      <div className="text-sm">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export default StatisticalArea;
