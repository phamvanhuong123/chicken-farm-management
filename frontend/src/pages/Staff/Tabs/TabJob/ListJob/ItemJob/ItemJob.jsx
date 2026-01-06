import {
  ChevronsUpDown,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
// import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import JobOption from "./JobOption/JobOption";
import { getLastUpperChar } from "~/utils/formatter";

const TaskCard = ({ task, hasMenu, areaId }) => {
  
  // const statusColor =
  //   status === "todo" ? "border-l-emerald-500" :
  //   status === "doing" ? "border-l-blue-500" : "border-l-slate-400";

  const statusColor = {
    toDo: "border-l-emerald-500",
    inProgress: "border-l-blue-500",
    done: "border-l-slate-400",
  };

  return (
    <div
      className={`group relative bg-white p-3 rounded-lg border border-slate-200 border-l-4 ${
        statusColor[task?.status]
      } shadow-sm hover:shadow-md transition-all cursor-pointer`}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h3 className="font-semibold text-sm text-slate-800 leading-tight">
          {task?.title}
        </h3>
        {hasMenu && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
            <JobOption task={task} areaId={areaId} />
            {/* Nếu JobOption chưa có style, có thể dùng tạm icon này: */}
            {/* <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button> */}
          </div>
        )}
      </div>

      {task?.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">
          {task?.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto">
        {/* Giả lập Avatar người nhận việc */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">
            {task?.userName && getLastUpperChar(task?.userName)}
          </div>
          <span className="text-xs font-medium text-slate-600">
            {task?.userName || "Chưa giao"}
          </span>
        </div>
      </div>
    </div>
  );
};

function ItemJob({ task }) {
  const [isOpen, setIsOpen] = useState(false);
  const { tasks } = task;
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-4 w-full bg-slate-50/50 p-4 rounded-xl border border-slate-200"
    >
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>{" "}
          {/* Điểm nhấn trang trí */}
          <h4 className="text-lg font-bold text-slate-800">{task?.areaName}</h4>
          <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
            {task?.tasks.length || 0} Công việc
          </span>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="hover:bg-slate-200">
            <span className="text-xs mr-2 text-slate-500">
              {isOpen ? "Thu gọn" : "Mở rộng"}
            </span>
            <ChevronsUpDown className="h-4 w-4 text-slate-500" />
          </Button>
        </CollapsibleTrigger>
      </div>

      {/* --- CONTENT --- */}
      <CollapsibleContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {/* CỘT 1: VIỆC CẦN LÀM */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Circle className="w-4 h-4 text-emerald-500" />
                <span>Việc cần làm</span>
              </div>
              <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-md">
                {tasks?.filter((item) => item?.status === "toDo")?.length}
              </span>
            </div>

            {/* Background cột task */}
            <div className="bg-slate-100/50 p-2 rounded-xl border border-slate-100 min-h-[200px] flex flex-col gap-3">
              {tasks
                ?.filter((item) => item?.status === "toDo")
                ?.map((item) => (
                  <TaskCard task={item} areaId={task?._id} hasMenu={true} />
                ))}

              {/* <TaskCard title="Vệ sinh máng ăn" assignee="Nguyễn Văn A" status="toDo" />
                <TaskCard title="Nhập cám mới" assignee="Trần Thị B" status="inProgress" />
                <TaskCard title="Báo cáo tuần" assignee="Admin" status="done" /> */}
            </div>
          </div>

          {/* CỘT 2: VIỆC ĐANG LÀM */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Việc đang làm</span>
              </div>
              <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-md">
                {tasks?.filter((item) => item?.status === "inProgress")?.length}
              </span>
            </div>
            <div className="bg-slate-100/50 p-2 rounded-xl border border-slate-100 min-h-[200px] flex flex-col gap-3">
              {tasks
                ?.filter((item) => item?.status === "inProgress")
                ?.map((item) => (
                  <TaskCard task={item} areaId={task?._id} hasMenu={true} />
                ))}
            </div>
          </div>

          {/* CỘT 3: HOÀN TẤT */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-purple-500" />
                <span>Hoàn tất</span>
              </div>
              <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-md">
                {tasks?.filter((item) => item?.status === "done")?.length}
              </span>
            </div>
            <div className="bg-slate-100/50 p-2 rounded-xl border border-slate-100 min-h-[200px] flex flex-col gap-3">
              {tasks
                ?.filter((item) => item?.status === "done")
                ?.map((item) => (
                  <TaskCard task={item} areaId={task?._id} hasMenu={true} />
                ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default ItemJob;
