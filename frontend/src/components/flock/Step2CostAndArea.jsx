import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function Step2CostAndArea() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block font-medium mb-1'>Chi phí nhập (VNĐ)</label>
          <input type='number' {...register('cost', { valueAsNumber: true })} placeholder='Tổng chi phí' className='border w-full px-3 py-2 rounded-lg' />
        </div>

        <div>
          <label className='block font-medium mb-1'>
            Khu nuôi <span className='text-red-500'>*</span>
          </label>
          <select {...register('area', { required: 'Vui lòng chọn khu nuôi' })} className='border w-full px-3 py-2 rounded-lg'>
            <option value=''>Chọn khu</option>
            <option value='A'>Khu A</option>
            <option value='B'>Khu B</option>
            <option value='C'>Khu C</option>
          </select>
          {errors.area && <p className='text-red-500 text-sm'>{errors.area.message}</p>}
        </div>
      </div>
    </div>
  );
}
