import { useEffect, useState } from "react";
import axiosInstance from "~/apis/index";
function Statistical({ flocks }) {
  const [logsTypeDeathNumber,setLogsTypeDeathNumber] = useState(0)
  const avgWeight = () => {
    const totalWeight = flocks.reduce((total, item) => {
      return total + Number(item.avgWeight);
    }, 0);
    return Number((totalWeight / flocks.length).toFixed(2));
  };
  
  useEffect(()=>{
    const fetchLogApis = async ()=>{
      const res = await axiosInstance.get("/logs")
  
      const listLogDeath = [...res.data?.data].filter(item => item?.type === "DEATH")
      const countLogDeath = listLogDeath.reduce((total,item)=>{
        return total += item?.quantity
      },0)
      const totalNumberFlock = flocks.reduce((total,item) =>{
        return total += item?.initialCount
      },0)
      setLogsTypeDeathNumber(Number(countLogDeath / totalNumberFlock * 100).toFixed(2))
    }
    fetchLogApis()
  },[])
  return (
    <>
      <div className="grid grid-cols-4 gap-4 mb-9 ">
        <div className="bg-green-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Tổng số đàn</p>
          <h2 className="text-2xl font-bold text-green-700">
            {flocks?.length}
          </h2>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Đàn đang nuôi</p>
          <h2 className="text-2xl font-bold text-blue-700">
            {flocks?.filter((f) => f.status === "Raising")?.length}
          </h2>
        </div>
        <div className="bg-purple-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Trọng lượng TB</p>
          <h2 className="text-2xl font-bold text-purple-700">
            {avgWeight()}kg
          </h2>
        </div>
        <div className="bg-orange-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Tỷ lệ chết TB</p>
          <h2 className="text-2xl font-bold text-orange-700">{logsTypeDeathNumber}%</h2>
        </div>
      </div>
    </>
  );
}
export default Statistical;
