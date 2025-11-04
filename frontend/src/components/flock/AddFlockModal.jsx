import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function AddFlockModal({ onClose, onSave }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm()

  const [successMessage, setSuccessMessage] = useState('')

  const onSubmit = (data) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // reset giờ để so sánh chuẩn
    const inputDate = new Date(data.importDate)
    inputDate.setHours(0, 0, 0, 0)

    if (inputDate > today) {
      setError('importDate', { message: 'Ngày nhập không được lớn hơn ngày hiện tại.' })
      return
    }

    if (data.quantity <= 0) {
      setError('quantity', { message: 'Số lượng phải lớn hơn 0.' })
      return
    }

    try {
      console.log('Thêm đàn mới:', data)
      setSuccessMessage('Thêm đàn mới thành công!')
      onSave?.(data)
      reset()
      setTimeout(() => {
        setSuccessMessage('')
        onClose()
      }, 2000)
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setSuccessMessage('Không thể thêm đàn. Vui lòng thử lại!')
    }
  }

  return (
    <>
      {/* Toast thông báo */}
      {successMessage && (
        <div className='fixed top-6 right-6 z-[9999] bg-green-50 border border-green-500 text-green-700 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-slideIn'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2}
            stroke='currentColor'
            className='w-5 h-5 text-green-600'
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
          </svg>
          <span className='font-medium'>{successMessage}</span>
        </div>
      )}

      {/* Modal thêm đàn */}
      <div className='fixed inset-0 bg-black/30 backdrop-blur-[2px] flex justify-center items-center z-50 transition-all duration-300'>
        <div className='bg-white rounded-2xl shadow-lg p-8 w-[650px] relative animate-fadeIn'>
          <h2 className='text-xl font-semibold mb-6 text-center text-gray-700'>
            Thêm đàn gà mới
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              {/* Ngày nhập */}
              <div>
                <label className='block font-medium'>
                  Ngày nhập <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  {...register('importDate', { required: 'Vui lòng chọn ngày nhập' })}
                  className='border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-green-400 outline-none'
                />
                {errors.importDate && (
                  <p className='text-red-500 text-sm'>{errors.importDate.message}</p>
                )}
              </div>

              {/* Nhà cung cấp */}
              <div>
                <label className='block font-medium'>
                  Nhà cung cấp <span className='text-red-500'>*</span>
                </label>
                <select
                  {...register('supplier', { required: 'Vui lòng chọn nhà cung cấp' })}
                  className='border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-green-400 outline-none'
                >
                  <option value=''>Chọn nhà cung cấp</option>
                  <option value='CP'>Công ty CP</option>
                  <option value='GreenFarm'>Green Farm</option>
                </select>
                {errors.supplier && (
                  <p className='text-red-500 text-sm'>{errors.supplier.message}</p>
                )}
              </div>

              {/* Giống gà */}
              <div>
                <label className='block font-medium'>
                  Giống gà <span className='text-red-500'>*</span>
                </label>
                <select
                  {...register('breed', { required: 'Vui lòng chọn giống gà' })}
                  className='border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-green-400 outline-none'
                >
                  <option value=''>Chọn giống</option>
                  <option value='Ri'>Gà Ri</option>
                  <option value='TamHoang'>Tam Hoàng</option>
                  <option value='AiCap'>Ai Cập</option>
                </select>
                {errors.breed && (
                  <p className='text-red-500 text-sm'>{errors.breed.message}</p>
                )}
              </div>

              {/* Số lượng */}
              <div>
                <label className='block font-medium'>
                  Số lượng <span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  {...register('quantity', {
                    required: 'Vui lòng nhập số lượng',
                    valueAsNumber: true,
                  })}
                  placeholder='Nhập số lượng'
                  className='border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-green-400 outline-none'
                />
                {errors.quantity && (
                  <p className='text-red-500 text-sm'>{errors.quantity.message}</p>
                )}
              </div>

              {/* Trọng lượng ban đầu */}
              <div className='col-span-2'>
                <label className='block font-medium'>
                  Trọng lượng ban đầu (kg) <span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  step='0.01'
                  {...register('initialWeight', {
                    required: 'Vui lòng nhập trọng lượng',
                  })}
                  placeholder='Nhập trọng lượng'
                  className='border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-green-400 outline-none'
                />
                {errors.initialWeight && (
                  <p className='text-red-500 text-sm'>{errors.initialWeight.message}</p>
                )}
              </div>
            </div>

            {/* Nút hành động */}
            <div className='flex justify-end gap-3 mt-6'>
              <button
                type='button'
                onClick={onClose}
                className='px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200'
              >
                Hủy
              </button>
              <button
                type='submit'
                className='px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200'
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Keyframes */}
      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slideIn {
            animation: slideIn 0.4s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.25s ease-out;
          }
        `}
      </style>
    </>
  )
}
