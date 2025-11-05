import dayjs from 'dayjs';

export const validateFlockData = (data) => {
  if (!data.importDate) {
    return 'Vui lòng chọn ngày nhập';
  }
  const today = dayjs().startOf('day');
  const importDate = dayjs(data.importDate);
  if (importDate.isAfter(today)) {
    return 'Ngày nhập không hợp lệ.';
  }
  if (!data.supplier) {
    return 'Vui lòng chọn nhà cung cấp';
  }
  if (!data.species) {
    return 'Vui lòng chọn giống gà';
  }
  if (data.quantity === undefined || data.quantity === null || data.quantity === '') {
    return 'Vui lòng nhập số lượng';
  }
  if (Number(data.quantity) <= 0) {
    return 'Số lượng phải lớn hơn 0.';
  }
  if (!data.initialWeight) {
    return 'Vui lòng nhập trọng lượng ban đầu';
  }
  if (!data.area) {
    return 'Vui lòng chọn khu nuôi';
  }
  return null;
};
