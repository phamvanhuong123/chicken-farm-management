import { useDispatch, useSelector } from "react-redux";
import ItemJob from "./ItemJob/ItemJob";
import { fetchGetAllTaskApi, getTaskState } from "~/slices/taskSlice";
import { useEffect } from "react";
import { getUserState } from "~/slices/authSlice";

function ListJob() {
  const user = useSelector((state) => getUserState(state));
  const tasks = useSelector((state) => getTaskState(state));
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user.id) return;
    const fetchApi = async () => {
      try {
        await dispatch(fetchGetAllTaskApi(user.id)).unwrap();
      } catch (error) {
        console.error("Fetch tasks failed:", error);
      }
    };
    fetchApi()
  }, [dispatch],user?.id);
  console.log(tasks)
  return (
    <div className="">
      {tasks.map((task) => (
        <ItemJob task={task} />
      ))}
    </div>
  );
}
export default ListJob;
