import { useEffect, useState } from "react";
import { useImport } from "./hooks/useImport";
import ImportTabs from "../../components/FlockTransactions/ImportTabs";
import ImportList from "../../components/FlockTransactions/ImportList";
import ImportForm from "../../components/FlockTransactions/ImportForm";
import DashboardKPI from "../../components/FlockTransactions/DashboardKPI";

function FlockTransactions() {
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
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

        {/* TAB LIST + BUTTON */}
        <div className="flex justify-between items-center mb-2">
          <TabsList className="flex gap-2">
            <TabsTrigger
              value="import"
              className="cursor-pointer px-4 py-2 rounded 
              data-[state=active]:bg-blue-500 data-[state=active]:text-white
              hover:bg-blue-100 transition-all duration-150"
            >
              Nhập chuồng
            </TabsTrigger>

            <TabsTrigger
              value="export"
              className="cursor-pointer px-4 py-2 rounded 
              data-[state=active]:bg-green-500 data-[state=active]:text-white
              hover:bg-green-100 transition-all duration-150"
            >
              Xuất chuồng
            </TabsTrigger>
          </TabsList>

          {/* BUTTON THÊM */}
          {activeTab === "import" && (
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 
              transition-all duration-150 shadow-sm hover:shadow cursor-pointer">
              <Plus size={16} className="mr-1" /> Nhập chuồng mới
            </Button>
          )}

          {activeTab === "export" && (
            <Button className="bg-green-500 hover:bg-green-600 text-white px-4 
              transition-all duration-150 shadow-sm hover:shadow cursor-pointer">
              <Plus size={16} className="mr-1" /> Xuất chuồng mới
            </Button>
          )}
        </div>

        {/* ==============================================================
            IMPORT TAB
        ============================================================== */}
        <TabsContent value="import" className="mt-4">

          {/* KPI */}
          <div className="grid grid-cols-3 gap-4">
            <KPICard icon={ArrowDownToLine} label="Tổng nhập" value={statsImport.totalImport} color="bg-blue-500" suffix=" con" />
            <KPICard icon={DollarSign} label="Chi phí nhập" value={statsImport.totalRevenue} color="bg-green-500" suffix="₫" />
            <KPICard icon={Clock} label="Đơn chờ" value={statsImport.pendingOrders} color="bg-yellow-500" />
          </div>

          {/* TABLE */}
          <div className="bg-white border rounded-lg overflow-hidden mt-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Ngày</th>
                  <th className="p-3 text-left">Đàn</th>
                  <th className="p-3 text-center">SL</th>
                  <th className="p-3 text-center">TL TB</th>
                  <th className="p-3 text-left">Nhà cung cấp</th>
                  <th className="p-3 text-center">Thanh toán</th>
                  <th className="p-3 text-center">Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan="7" className="p-4 text-center">
                    Chưa có dữ liệu nhập chuồng
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ==============================================================
            EXPORT TAB
        ============================================================== */}
        <TabsContent value="export" className="mt-4">

          {/* KPI */}
          <div className="grid grid-cols-3 gap-4">
            <KPICard icon={ArrowUpFromLine} label="Tổng xuất" value={statsExport.totalExport} color="bg-orange-500" suffix=" con" />
            <KPICard icon={DollarSign} label="Doanh thu" value={statsExport.totalRevenue} color="bg-green-500" suffix="₫" />
            <KPICard icon={Clock} label="Đơn chờ" value={statsExport.pendingOrders} color="bg-yellow-500" />
          </div>

          {/* TABLE */}
          <div className="bg-white border rounded-lg overflow-hidden mt-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Ngày</th>
                  <th className="p-3 text-left">Đàn</th>
                  <th className="p-3 text-center">SL</th>
                  <th className="p-3 text-center">TL TB</th>
                  <th className="p-3 text-center">Giá/kg</th>
                  <th className="p-3 text-left">Khách hàng</th>
                  <th className="p-3 text-center">Thanh toán</th>
                  <th className="p-3 text-right">Doanh thu</th>
                  <th className="p-3 text-center">Trạng thái</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan="10" className="p-4 text-center">
                    Chưa có dữ liệu xuất chuồng
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}

export default FlockTransactions; // Đảm bảo export đúng