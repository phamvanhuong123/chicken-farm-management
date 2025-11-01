import React from 'react'
import Header from './Header'
import SideBar from './SideBar'
import { Outlet } from 'react-router-dom'

export default function LayoutDefault() {
  return (
    <div className='flex min-h-screen'>
      {/* Sidebar bên trái */}
      <aside className='w-64 bg-white border-r shadow-sm'>
        <SideBar />
      </aside>

      {/* Khu vực nội dung chính */}
      <div className='flex-1 flex flex-col bg-gray-50'>
        {/* Header */}
        <header className='shadow-sm bg-white'>
          <Header />
        </header>

        {/* Nội dung trang */}
        <main className='flex-1 p-6'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
