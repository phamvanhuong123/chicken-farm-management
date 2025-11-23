import { PlusIcon } from "lucide-react"
import { Button } from "~/components/ui/button"


function ButtonStaffAdd(){
    return <>
    <Button className={'bg-green-400 hover:bg-green-500 cursor-pointer'}> <PlusIcon/>Thêm nhân viên</Button>
    </>
}
export default ButtonStaffAdd