import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function Step1BasicInfo() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block font-medium mb-1'>
            Ngày nhập <span className='text-red-500'>*</span>
          </label>
          <input
            type='date'
            {...register('importDate', { required: 'Vui lòng chọn ngày nhập' })}
            className='border w-full px-3 py-2 rounded-lg'
          />
          {errors.importDate && <p className='text-red-500 text-sm'>{errors.importDate.message}</p>}
        </div>

        <div>
          <label className='block font-medium mb-1'>
            Nhà cung cấp <span className='text-red-500'>*</span>
          </label>
          <select
            {...register('supplier', { required: 'Vui lòng chọn nhà cung cấp' })}
            className='border w-full px-3 py-2 rounded-lg'
          >
            <option value=''>Chọn nhà cung cấp</option>
            <option value='CP'>Công ty CP</option>
            <option value='GreenFarm'>Green Farm</option>
          </select>
          {errors.supplier && <p className='text-red-500 text-sm'>{errors.supplier.message}</p>}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4 mt-4'>
        <div>
          <label className='block font-medium mb-1'>
            Giống gà <span className='text-red-500'>*</span>
          </label>
          <select {...register('species', { required: 'Vui lòng chọn giống gà' })} className='border w-full px-3 py-2 rounded-lg'>
            <option value=''>Chọn giống</option>
            <option value='Ri'>Gà Ri</option>
            <option value='TamHoang'>Tam Hoàng</option>
            <option value='AiCap'>Ai Cập</option>
          </select>
          {errors.species && <p className='text-red-500 text-sm'>{errors.species.message}</p>}
        </div>

        <div>
          <label className='block font-medium mb-1'>
            Số lượng <span className='text-red-500'>*</span>
          </label>
          <input
            type='number'
            {...register('quantity', {
              required: 'Vui lòng nhập số lượng',
              valueAsNumber: true,
              min: { value: 1, message: 'Số lượng phải lớn hơn 0' },
            })}
            placeholder='Nhập số lượng'
            className='border w-full px-3 py-2 rounded-lg'
          />
          {errors.quantity && <p className='text-red-500 text-sm'>{errors.quantity.message}</p>}
        </div>
      </div>

      <div className='mt-4'>
        <label className='block font-medium mb-1'>
          Trọng lượng ban đầu (kg) <span className='text-red-500'>*</span>
        </label>
        <input
          type='number'
          step='0.01'
          {...register('initialWeight', {
            required: 'Vui lòng nhập trọng lượng ban đầu',
            valueAsNumber: true,
            min: { value: 0.01, message: 'Trọng lượng phải lớn hơn 0' },
          })}
          placeholder='Nhập trọng lượng'
          className='border w-full px-3 py-2 rounded-lg'
        />
        {errors.initialWeight && <p className='text-red-500 text-sm'>{errors.initialWeight.message}</p>}
      </div>
    </div>
  );
}
