import { EllipsisVertical, MoveRight, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

function JobOption() {
  const handleChangeStatus = () => {
    console.log("Thay đổi trạng thái");
  };
  const handleDelete = () => {
    console.log("Xoá");
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
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleChangeStatus}
              >
                Thay đổi trạng thái
                <DropdownMenuShortcut>
                  <MoveRight />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
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
