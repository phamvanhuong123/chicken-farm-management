import { Button } from "~/components/ui/button";
import TabStaff from "./TabStaff/TabStaff";
import TabJob from "./TabJob/TabJob";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchEmployeeApi } from "~/slices/employeeSlice";
function Tabs({ tabs, handleChangeTab }) {
  const user = useSelector((state) => state.auth.user);
  const dispath = useDispatch();
  useEffect(() => {
    console.log(user);

    if (user) {
      dispath(fetchEmployeeApi(user?.id));
    }
  }, [dispath, user]);
  return (
    <div>
      <div className="bg-white w-full mb-5 px-2 py-3.5 flex gap-2.5 rounded-[10px]">
        <Button
          onClick={() => {
            handleChangeTab("staff");
          }}
          className={`cursor-pointer ${
            tabs === "staff" &&
            "bg-green-500 text-white hover:text-white hover:bg-green-600"
          }`}
          variant="outline"
        >
          Nhân viên
        </Button>
        <Button
          onClick={() => {
            handleChangeTab("job");
          }}
          className={`cursor-pointer ${
            tabs === "job" &&
            "bg-green-500 text-white hover:text-white hover:bg-green-600"
          }`}
          variant="outline"
        >
          Công việc
        </Button>
      </div>
      {tabs === "staff" && <TabStaff />}
      {tabs === "job" && <TabJob />}
    </div>
  );
}

export default Tabs;
