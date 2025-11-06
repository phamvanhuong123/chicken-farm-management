function Dashboard() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-3 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full shadow-lg shadow-emerald-500/20"></div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Tổng quan
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Chào mừng bạn trở lại! Dưới đây là tổng quan về hoạt động trang trại của bạn
          </p>
        </div>

        {/* Stats Grid - FIXED */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Tổng đàn gà', value: '2,847', change: '+12%', color: 'emerald' },
            { label: 'Vật tư tồn kho', value: '156', change: '-3%', color: 'blue' },
            { label: 'Doanh thu tháng', value: '84.2Tr', change: '+8%', color: 'purple' },
            { label: 'Tỷ lệ sản xuất', value: '94%', change: '+2%', color: 'orange' },
          ].map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-6 shadow-2xl border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-300 bg-gray-600/50 px-3 py-1 rounded-full border border-gray-500/30">
                  {stat.label}
                </span>
                <div className={`text-sm font-semibold ${parseInt(stat.change) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-1000 shadow-lg shadow-emerald-500/25"
                  style={{ width: `${Math.min(100, 70 + index * 10)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions - FIXED */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 shadow-2xl border border-gray-700/50 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Hành động nhanh</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Thêm đàn mới', 'Nhập kho', 'Báo cáo', 'Cài đặt'].map((action, index) => (
              <button
                key={index}
                className="p-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl hover:from-emerald-500/20 hover:to-teal-500/20 border border-gray-600 hover:border-emerald-500/30 transition-all duration-300 group"
              >
                <div className="text-lg font-semibold text-gray-300 group-hover:text-emerald-400 mb-2">
                  {action}
                </div>
                <div className="text-sm text-gray-500 group-hover:text-emerald-400">
                  Xem chi tiết →
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity - FIXED */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 shadow-2xl border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-6">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {[
              { action: 'Nhập kho thức ăn mới', time: '2 giờ trước', type: 'success' },
              { action: 'Tiêm vaccine đàn A1', time: '4 giờ trước', type: 'success' },
              { action: 'Báo cáo sản xuất tuần', time: '1 ngày trước', type: 'info' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 hover:bg-gray-700/50 rounded-xl transition-colors border border-gray-600/30">
                <div className={`w-3 h-3 rounded-full ${activity.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'} shadow-lg`}></div>
                <div className="flex-1">
                  <p className="text-gray-300 font-medium">{activity.action}</p>
                  <p className="text-gray-500 text-sm">{activity.time}</p>
                </div>
                <div className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded-full">
                  Hoàn thành
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;