import { PlusIcon } from "lucide-react"
import { Button } from "~/components/ui/button"


function ButtonJobAdd(){
    return <>
    <Button className={'bg-green-400 hover:bg-green-500 cursor-pointer'}> <PlusIcon/>Thêm công việc</Button>
    </>
}
export default ButtonJobAdd