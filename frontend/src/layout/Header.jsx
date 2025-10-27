import { RiMenuFold2Line } from "react-icons/ri";
import { CiBellOn } from "react-icons/ci";
function Header(){
    return <>   
    
    <div className="flex flex-row px-6 bg-white border border-gray-200 h-14">
            <div className="w-64 flex justify-between border-r border-gray-200 items-center">
                <p>Farm Go</p>
                
            </div>
            <div className="px-2 flex flex-1 items-center justify-between">
                <div className="flex  items-center gap-1.5 ">
                    <button className="cursor-pointer">
                        <RiMenuFold2Line />
                    </button>
                    <p>Trang trại gia cầm</p>
                </div>
                <div className="flex items-center gap-4  px-1.5">
                    <div className="notifications relative">
                        <CiBellOn className="text-2xl"/>
                        <span className="rounded-full absolute -top-2.5 -right-1.5 text-xs bg-red-600 w-4 h-4 flex items-center justify-center text-white font-medium">3</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">H</div>
                        <div>
                            <p className="text-base font-semibold">Vũ FarmGo</p>
                            <p>Quản li trang trại</p>
                        </div>
                    </div>
                </div>
                
               
            </div>
        </div>
    </>
}
export default Header