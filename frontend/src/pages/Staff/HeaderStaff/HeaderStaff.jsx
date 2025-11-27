import ButtonJobAdd from "./ButtonAdd/ButtonJobAdd"
import ButtonStaffAdd from "./ButtonAdd/ButtonStaffAdd"
function HeaderStaff({tabs}){
    return <div className="flex max-[640px]:block justify-between mb-8 ">
        <div  className="max-[640px]:mb-2.5">
            <h1 className="text-3xl font-bold mb-1">Nhân sự và công việc</h1>
            <p className="text-sm">Quản lí nhân viên và phân công công việc</p>
        </div>
        <div className="flex gap-2">
            {tabs === "staff" && <ButtonStaffAdd/>}
            {tabs === "job" && <ButtonJobAdd/>}
        </div>
        
    
    </div>
}
export default HeaderStaff