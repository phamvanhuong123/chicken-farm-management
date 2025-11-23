import { Button } from "~/components/ui/button"
import {ArrowDownFromLine, ArrowDownToLine, PlusIcon} from 'lucide-react'
import ButtonFlockAdd from "../ButtonFlockAdd/ButtonFlockAdd"





function HeaderFlock(){
    return <div className="flex justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold mb-1">Quản lí đàn gà</h1>
            <p className="text-sm">Theo dõi và quản lý các đàn gà trong trang trại</p>
        </div>
        <div className="flex gap-2">
            <Button variant={'outline'} className={'cursor-pointer'}> <ArrowDownToLine />Xuất excel</Button>
            <Button variant={'outline'} className={'cursor-pointer'}> <ArrowDownFromLine className="rotate-180"  />Nhập excel</Button>
            <ButtonFlockAdd/>
        </div>
        
    
    </div>
} 
export default HeaderFlock