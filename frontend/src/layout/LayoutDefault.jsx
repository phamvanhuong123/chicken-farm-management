import { Outlet } from 'react-router'
import Header from './Header'
import SideBar from './sideBar'

function LayoutDefault() {
  return <>
    <div >
      <Header/>
      <div className='flex px-6'>
        <SideBar/>
        <div className='flex-1'>
          <Outlet/>
        </div>
      </div>
    </div>
  </>
}
export default LayoutDefault