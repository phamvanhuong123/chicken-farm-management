import { EllipsisVertical, MoveRight, Trash } from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { fetchDeleteTaskApi, fetchUpdateTaskApi } from "~/slices/taskSlice";

function JobOption({ task, areaId }) {
  const dispatch = useDispatch();

  const objectStatus  ={
    toDo : "To Do",
    inProgress : "In Progress",
    done : "Done"
  }
  const handleChangeStatus = (status) => {
    dispatch(fetchUpdateTaskApi({
      id : task._id,
      updateData : {status}
    }))
  };
  const handleDelete = () => {
    try{
      dispatch(fetchDeleteTaskApi({ taskId: task._id, areaId: areaId })).unwrap()

    }
    catch(error){
      toast.error("Thất bại " + error)
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EllipsisVertical
            size={20}
            className="absolute top-1 right-1 cursor-pointer"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Tuỳ chọn</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                Thay đổi trạng thái
              
              </DropdownMenuSubTrigger>

              <DropdownMenuSubContent className="w-40">
                {Object.keys(objectStatus).filter(fieldName => fieldName !== task.status).map(fieldName =>
                  <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleChangeStatus(fieldName)}
                >
                   {objectStatus[fieldName]}
                </DropdownMenuItem>
                )}
                {/* <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleChangeStatus("DOING")}
                >
                   Đang làm
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleChangeStatus("DONE")}
                >
                   Hoàn thành
                </DropdownMenuItem> */}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem className="cursor-pointer" onClick={handleDelete}>
              Xoá
              <DropdownMenuShortcut>
                {" "}
                <Trash />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
export default JobOption;
