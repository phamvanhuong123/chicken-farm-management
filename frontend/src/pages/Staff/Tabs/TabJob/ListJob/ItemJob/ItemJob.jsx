import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import JobOption from "./JobOption/JobOption";

function ItemJob() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-2  w-full"
    >
      <div className="flex items-center  gap-4 px-4">
        <h4 className="text-sm font-semibold">Khu nuôi A</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
            <ChevronsUpDown />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="flex gap-2 ">
        <div className="rounded-md border px-4  py-3 bg-white  w-[30%] flex flex-col gap-2 ">
          <p className="text-[20px] font-semibold">Việc cần làm</p>
          <div className="border-[0.5px] border-b-green-500 "></div>
          <div className=" bg-green-200 rounded-[3px] p-2 relative">
            <h3 className="font-semibold text-[17px]">Kiểm tra sức khoẻ</h3>
            <p className="">
              Kiểm tra tổng thể sức khỏe và cân nặng đàn gà A001
            </p>
            <div>Phạm Văn Hương</div>
            <JobOption/>
          </div>
          <div className=" bg-green-200 rounded-[3px] p-2">Công việc 1</div>
          <div className=" bg-green-200 rounded-[3px] p-2">Công việc 2</div>
          <div className=" bg-green-200 rounded-[3px] p-2">Công việc 3</div>
        </div>
        <div className="rounded-md border px-4 py-2 bg-white  w-[30%]">
          <p className="text-[20px] font-semibold">Việc đang làm</p>
        </div>
        <div className="rounded-md border px-4 py-2 bg-white  w-[30%]">
          <p className="text-[20px] font-semibold">Hoàn tất</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
export default ItemJob;
