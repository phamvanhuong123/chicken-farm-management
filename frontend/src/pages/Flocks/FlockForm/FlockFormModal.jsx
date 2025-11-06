import React from 'react'
import { useForm } from 'react-hook-form'

export default function FlockFormModal({ onClose, onSave, flock }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: flock || {
      name: '',
      breed: '',
      importDate: '',
      quantity: '',
    },
  })

  const onSubmit = async (data) => {
    let res
    if (flock) {
      // PUT - cập nhật đàn
      res = await fetch(`http://localhost:5000/api/flocks/${flock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      // POST - thêm đàn mới
      res = await fetch('http://localhost:5000/api/flocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }

    const saved = await res.json()
    onSave(saved)
  }

  // Danh sách giống gà
  const breeds = ['Gà Ri', 'Gà Tam Hoàng', 'Gà Ai Cập']

  return (
    <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50'>
      <div className='bg-white p-6 rounded-lg w-96 shadow-lg'>
        <h2 className='text-xl font-semibold mb-4'>
          {flock ? 'Chỉnh sửa thông tin đàn' : 'Thêm đàn mới'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-3'>
            <label className='block mb-1 font-medium'>
              Tên đàn <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('name', { required: 'Tên đàn là bắt buộc' })}
              className='border rounded w-full p-2'
              placeholder='Nhập tên đàn'
            />
            {errors.name && (
              <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>
            )}
          </div>

          <div className='mb-3'>
            <label className='block mb-1 font-medium'>
              Giống <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('breed', { required: 'Vui lòng chọn giống gà' })}
              className='border rounded w-full p-2 text-sm'
            >
              <option value=''>-- Chọn giống gà --</option>
              {breeds.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {errors.breed && (
              <p className='text-red-500 text-sm mt-1'>{errors.breed.message}</p>
            )}
          </div>

          <div className='mb-3'>
            <label className='block mb-1 font-medium'>Ngày nhập</label>
            <input
              type='date'
              {...register('importDate')}
              className='border rounded w-full p-2'
            />
          </div>

          <div className='mb-4'>
            <label className='block mb-1 font-medium'>Số lượng</label>
            <input
              type='number'
              {...register('quantity')}
              className='border rounded w-full p-2'
              placeholder='Nhập số lượng gà'
            />
          </div>

          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={onClose}
              className='bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500'
            >
              Hủy
            </button>
            <button
              type='submit'
              className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}