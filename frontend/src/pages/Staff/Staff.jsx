import { useState } from "react"
import HeaderStaff from "./HeaderStaff/HeaderStaff"
import Tabs from "./Tabs/Tabs"

function Staff(){
    const [tabs,setTabs] = useState('staff')
    const handleChangeTab = (data) =>{
        setTabs(data)
    }
    return <div className="px-8 mt-8">
        <HeaderStaff tabs={tabs}/>
        <Tabs tabs={tabs} handleChangeTab={handleChangeTab} />
    </div>
}
export default Staff