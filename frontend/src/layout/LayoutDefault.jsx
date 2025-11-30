import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Header from './Header'
import SideBar from './SideBar'


function LayoutDefault() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }
  

 

  return (
    <div className="min-h-screen flex flex-col ">
      {/* Fixed Header */}
      <Header 
        onToggleSidebar={toggleSidebar} 
        isSidebarCollapsed={isSidebarCollapsed}
      />
      
      {/* Main Content Area */}
      <div className="flex flex-1 pt-16"> {/* pt-16 để tránh header fixed */}
        {/* Sidebar */}
        <SideBar isCollapsed={isSidebarCollapsed} />
        
        {/* Main Content */}
        <main className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}
          min-h-[calc(100vh-4rem)]
          bg-gray-100
        `}>
          <Outlet />
        </main>
      </div>
      
      {/* Footer */}
      {/* <Footer /> */}
    </div>
  )
}

export default LayoutDefault