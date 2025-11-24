import { CircleDollarSign, User, UserRoundX, UsersRound } from "lucide-react";

function Statistical() {
  return (
    <>
      <div className="grid grid-cols-4 gap-4 mb-9 ">
        <div className=" p-4 rounded-2xl shadow-sm flex gap-3 items-center bg-white">
          <div className="bg-green-100 p-3 rounded-sm">
            <UsersRound color="green" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Tổng nhân viên</p>
            <h2 className="text-2xl font-bold text-green-700">4</h2>
          </div>
        </div>
        <div className=" p-4 rounded-2xl shadow-sm flex gap-3 items-center bg-white">
          <div className="bg-blue-200 p-3 rounded-sm">
            <User color="blue" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Đang làm việc</p>
            <h2 className="text-2xl font-bold text-blue-700">3</h2>
          </div>
        </div>
        <div className=" p-4 rounded-2xl shadow-sm flex gap-3 items-center bg-white">
          <div className="bg-purple-200 p-3 rounded-sm">
            <UserRoundX color="purple" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Nghĩ phép</p>
            <h2 className="text-2xl font-bold text-purple-700">1</h2>
          </div>
        </div>
        <div className=" p-4 rounded-2xl shadow-sm flex gap-3 items-center bg-white">
          <div className="bg-orange-200 p-3 rounded-sm">
            <CircleDollarSign color="orange" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Tổng lương</p>
            <h2 className="text-2xl font-bold text-orange-700">45M</h2>
          </div>
        </div>
      </div>
    </>
  );
}
export default Statistical;
