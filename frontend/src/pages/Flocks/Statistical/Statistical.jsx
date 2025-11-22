function Statistical({flocks}){
    return <>
    <div className="grid grid-cols-4 gap-4 mb-9 ">
        <div className="bg-green-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Tổng số đàn</p>
          <h2 className="text-2xl font-bold text-green-700">{flocks?.length}</h2>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Đàn đang nuôi</p>
          <h2 className="text-2xl font-bold text-blue-700">
            {flocks?.filter((f) => f.status === "Đang nuôi")?.length}
          </h2>
        </div>
        <div className="bg-purple-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Trọng lượng TB</p>
          <h2 className="text-2xl font-bold text-purple-700">1.9kg</h2>
        </div>
        <div className="bg-orange-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Tỷ lệ chết TB</p>
          <h2 className="text-2xl font-bold text-orange-700">2.1%</h2>
        </div>
      </div>
    
    </>
}
export default Statistical