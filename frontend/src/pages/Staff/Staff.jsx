import { useState } from "react"
import HeaderStaff from "./HeaderStaff/HeaderStaff"
import Statistical from "./Statistical/Statistical"
import TabStaff from "./TabStaff/TabStaff"

function Staff(){
    const [tabs,setTabs] = useState('employee')
    const handleChangeTab = (data) =>{
        setTabs(data)
    }
    return <div className="px-8 mt-8">
        <HeaderStaff tabs={tabs}/>
        <TabStaff tabs={tabs} handleChangeTab={handleChangeTab} />
        <Statistical/>
    </div>
}
export default Staff