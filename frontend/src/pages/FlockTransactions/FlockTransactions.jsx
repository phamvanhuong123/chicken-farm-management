import { useEffect, useState } from "react";
import { useImport } from "../FlockTransactions/hooks/useImport";
import ImportTabs from "../FlockTransactions/components/ImportTabs";
import ImportList from "../FlockTransactions/components/ImportList";
import ImportForm from "../FlockTransactions/components/ImportForm";
import DashboardKPI from "../FlockTransactions/components/DashboardKPI";

function ImportPage() {
  const { imports, loadData, createImport } = useImport();
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState("nhap");
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalImport: 1500,
    totalExport: 300,
    revenue: 66250000,
    activeFarms: 1
  });

  useEffect(() => {
    loadData();
    // TODO: Gọi API lấy dashboard data từ analytics.service
    // loadDashboardData();
  }, []);

  const handleCreateImport = async (data) => {
    setLoading(true);
    try {
      await createImport(data);
      alert("Thêm lứa nhập chuồng thành công.");
      setShowForm(false);
      
      // Cập nhật KPI dashboard
      setDashboardData(prev => ({
        ...prev,
        totalImport: prev.totalImport + parseInt(data.quantity)
      }));
    } catch (error) {
      alert("Không thể lưu, vui lòng thử lại sau.");
      console.error("Error creating import:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-8 mt-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Nhập / Xuất chuồng</h1>
      
      {/* DASHBOARD KPI */}
      <DashboardKPI data={dashboardData} />
      
      {/* TAB */}
      <ImportTabs tab={tab} setTab={setTab} />

      {/* TAB: XUẤT CHUỒNG */}
      {tab === "xuat" && (
        <div className="mt-6 p-6 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600 text-[15px]">
            Đây là giao diện xuất chuồng. Tính năng đang được phát triển.
          </p>
        </div>
      )}

      {/* TAB: NHẬP CHUỒNG */}
      {tab === "nhap" && (
        <>
          {/* BUTTON */}
          <div className="flex justify-between items-center mt-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Danh sách nhập chuồng</h2>
              <p className="text-sm text-gray-500">Quản lý các lứa gia súc nhập chuồng</p>
            </div>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              onClick={() => setShowForm(true)}
              disabled={loading}
            >
              <span>+</span>
              <span>Nhập chuồng mới</span>
            </button>
          </div>

          {/* DANH SÁCH */}
          <ImportList list={imports} />

          {/* FORM POPUP */}
          {showForm && (
            <ImportForm
              onClose={() => setShowForm(false)}
              onSubmit={handleCreateImport}
            />
          )}
        </>
      )}
    </div>
  );
}
export default FlockTransactions