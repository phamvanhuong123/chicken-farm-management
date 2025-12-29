import { useState, useEffect } from "react";

export default function ImportForm({ onClose, onSubmit, areaCurrentCounts = {}, editData = null, areas = [] }) {
  const isEditMode = !!editData;

  const [form, setForm] = useState({
    importDate: editData?.importDate?.split('T')[0] || "",
    supplier: editData?.supplier || "",
    breed: editData?.breed || "",
    quantity: editData?.quantity || "",
    avgWeight: editData?.avgWeight || "",
    barn: editData?.barn || "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [areaError, setAreaError] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [originalData, setOriginalData] = useState(editData || null);

  useEffect(() => {
    if (editData?.barn && areas.length > 0) {
      const area = areas.find(a => a.name === editData.barn);
      setSelectedArea(area);
    }

    if (editData) {
      setOriginalData(editData);
    }
  }, [editData, areas]);

  // Hàm tính dung lượng còn trống
  const getRemainingCapacity = (barnName) => {
    const area = areas.find(a => a.name === barnName);
    if (!area) return 0;

    return area.currentCapacity || 0; // currentCapacity chính là dung lượng còn trống
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "barn") {
      const selected = areas.find(area => area.name === value);
      setSelectedArea(selected);
    }

    setForm({ ...form, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });

    if (name === "quantity" && selectedArea) {
      validateField(name, value, selectedArea);
    } else {
      validateField(name, value);
    }
  };

  const validateField = (name, value, selectedAreaForValidation = selectedArea) => {
    let error = '';

    switch (name) {
      case 'importDate':
        if (!value.trim()) {
          error = 'Ngày nhập không được để trống';
        } else if (new Date(value) > new Date()) {
          error = 'Ngày nhập không được lớn hơn ngày hiện tại';
        }
        break;

      case 'supplier':
        if (!value.trim()) {
          error = 'Nhà cung cấp không được để trống';
        } else if (value.trim().length < 2) {
          error = 'Nhà cung cấp phải có ít nhất 2 ký tự';
        }
        break;

      case 'breed':
        if (!value.trim()) {
          error = 'Giống không được để trống';
        }
        break;

      case 'quantity':
        if (!value) {
          error = 'Số lượng không được để trống';
        } else if (value <= 0) {
          error = 'Số lượng phải lớn hơn 0';
        } else if (value > 100000) {
          error = 'Số lượng không được vượt quá 100,000';
        } else if (selectedAreaForValidation && selectedAreaForValidation.maxCapacity) {
          const remainingCapacity = getRemainingCapacity(selectedAreaForValidation.name);
          const requestedQuantity = parseInt(value);

          let actualRemainingCapacity = remainingCapacity;

          // XỬ LÝ ĐẶC BIỆT KHI EDIT
          if (isEditMode && originalData) {
            if (selectedAreaForValidation.name === originalData.barn) {
              // CÙNG KHU: cộng thêm số lượng cũ vào dung lượng trống
              actualRemainingCapacity = remainingCapacity + originalData.quantity;
            }
            // KHÁC KHU: giữ nguyên (vì chưa chuyển qua)
          }

          if (requestedQuantity > actualRemainingCapacity) {
            error = `Số lượng vượt quá dung lượng còn trống. Khu nuôi còn trống: ${actualRemainingCapacity}`;
          }
        }
        break;

      case 'avgWeight':
        if (!value) {
          error = 'Trọng lượng TB không được để trống';
        } else if (value <= 0) {
          error = 'Trọng lượng TB phải lớn hơn 0';
        } else if (value > 1000) {
          error = 'Trọng lượng TB không được vượt quá 1000 kg';
        }
        break;

      case 'barn':
        if (!value.trim()) {
          error = 'Khu nuôi không được để trống';
        }
        break;

      default:
        break;
    }

    if (error) {
      setErrors({ ...errors, [name]: error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.importDate.trim()) {
      newErrors.importDate = 'Ngày nhập không được để trống';
    } else if (new Date(form.importDate) > new Date()) {
      newErrors.importDate = 'Ngày nhập không được lớn hơn ngày hiện tại';
    }

    if (!form.supplier.trim()) {
      newErrors.supplier = 'Nhà cung cấp không được để trống';
    } else if (form.supplier.trim().length < 2) {
      newErrors.supplier = 'Nhà cung cấp phải có ít nhất 2 ký tự';
    }

    if (!form.breed.trim()) {
      newErrors.breed = 'Giống không được để trống';
    }

    if (!form.quantity) {
      newErrors.quantity = 'Số lượng không được để trống';
    } else if (form.quantity <= 0) {
      newErrors.quantity = 'Số lượng phải lớn hơn 0';
    } else if (form.quantity > 100000) {
      newErrors.quantity = 'Số lượng không được vượt quá 100,000';
    } else if (selectedArea && selectedArea.maxCapacity) {
      const remainingCapacity = getRemainingCapacity(selectedArea.name);
      const requestedQuantity = parseInt(form.quantity);

      // XỬ LÝ ĐẶC BIỆT KHI EDIT
      let actualRemainingCapacity = remainingCapacity;
      if (isEditMode && originalData) {
        if (selectedArea.name === originalData.barn) {
          // CÙNG KHU: cộng thêm số lượng cũ vào dung lượng trống
          actualRemainingCapacity = remainingCapacity + originalData.quantity;
        }
        // KHÁC KHU: giữ nguyên (vì chưa chuyển qua)
      }

      if (requestedQuantity > actualRemainingCapacity) {
        newErrors.quantity = `Số lượng vượt quá dung lượng còn trống. Khu nuôi còn trống: ${actualRemainingCapacity}`;
      }
    }

    if (!form.avgWeight) {
      newErrors.avgWeight = 'Trọng lượng TB không được để trống';
    } else if (form.avgWeight <= 0) {
      newErrors.avgWeight = 'Trọng lượng TB phải lớn hơn 0';
    } else if (form.avgWeight > 1000) {
      newErrors.avgWeight = 'Trọng lượng TB không được vượt quá 1000 kg';
    }

    if (!form.barn.trim()) {
      newErrors.barn = 'Khu nuôi không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    const allFields = ['importDate', 'supplier', 'breed', 'quantity', 'avgWeight', 'barn'];
    const allTouched = {};
    allFields.forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    onSubmit(form);
  };

  const handleSubmitWithEnter = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const shouldShowError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  // Hàm tính dung lượng còn trống để hiển thị
  const calculateRemainingCapacity = () => {
    if (!selectedArea) return null;

    let remainingCapacity = getRemainingCapacity(selectedArea.name);
    const maxCapacity = selectedArea.maxCapacity || 0;

    // Xử lý đặc biệt khi edit
    if (isEditMode && originalData) {
      if (selectedArea.name === originalData.barn) {
        remainingCapacity = remainingCapacity + originalData.quantity;
      }
    }

    return {
      remaining: remainingCapacity,
      max: maxCapacity
    };
  };

  // Hàm để định dạng tên option
  const formatAreaOption = (area) => {
    const remainingCapacity = area.currentCapacity || 0; // Dung lượng còn trống
    const maxCapacity = area.maxCapacity || 0;
    const currentCount = maxCapacity - remainingCapacity; // Số gà hiện có

    // Hiển thị dung lượng còn trống/tối đa
    return `${area.name} (Còn trống: ${remainingCapacity}/${maxCapacity})`;
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto py-4">
      <div className="bg-white w-[620px] max-w-[95vw] p-6 rounded-lg shadow-lg my-auto">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-4">
          {isEditMode ? 'Chỉnh sửa đơn nhập' : 'Nhập chuồng mới'}
        </h2>

        {isEditMode && originalData && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Mã đơn:</span> {originalData._id?.slice(-6).toUpperCase()}
            </p>
            {originalData.flockId && (
              <p className="text-xs text-blue-600 mt-1">
                <span className="font-semibold">Flock ID:</span> {originalData.flockId.slice(-6).toUpperCase()}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày nhập <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="importDate"
              value={form.importDate}
              onChange={handleChange}
              onBlur={handleBlur}
              max={new Date().toISOString().split('T')[0]}
              className={`border p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent ${shouldShowError('importDate') ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {shouldShowError('importDate') && (
              <p className="text-red-500 text-xs mt-1">{errors.importDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhà cung cấp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="supplier"
              value={form.supplier}
              placeholder="Nhập tên nhà cung cấp"
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyPress={handleSubmitWithEnter}
              className={`border p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent ${shouldShowError('supplier') ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {shouldShowError('supplier') && (
              <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giống <span className="text-red-500">*</span>
            </label>
            <select
              name="breed"
              value={form.breed}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`border p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent ${shouldShowError('breed') ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">Chọn giống</option>
              <option value="Gà ta">Gà ta</option>
              <option value="Gà công nghiệp">Gà công nghiệp</option>
              <option value="Gà thả vườn">Gà thả vườn</option>
              <option value="Gà tre">Gà tre</option>
              <option value="Gà ta lai F1">Gà ta lai F1</option>
              <option value="Gà cứng nghiệp">Gà cứng nghiệp</option>
            </select>
            {shouldShowError('breed') && (
              <p className="text-red-500 text-xs mt-1">{errors.breed}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                placeholder="0"
                min="1"
                max={selectedArea ? selectedArea.maxCapacity || "100000" : "100000"}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyPress={handleSubmitWithEnter}
                className={`border p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent ${shouldShowError('quantity') ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {shouldShowError('quantity') && (
                <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
              )}
              {selectedArea && form.quantity && !errors.quantity && (
                <p className="text-green-600 text-xs mt-1">
                  Còn trống: {calculateRemainingCapacity()?.remaining} / {calculateRemainingCapacity()?.max}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trọng lượng TB (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="avgWeight"
                value={form.avgWeight}
                placeholder="0.0"
                step="0.1"
                min="0.1"
                max="1000"
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyPress={handleSubmitWithEnter}
                className={`border p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent ${shouldShowError('avgWeight') ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {shouldShowError('avgWeight') && (
                <p className="text-red-500 text-xs mt-1">{errors.avgWeight}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khu nuôi <span className="text-red-500">*</span>
            </label>
            <select
              name="barn"
              value={form.barn}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loadingAreas}
              className={`border p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${shouldShowError('barn') ? 'border-red-500' : 'border-gray-300'
                } ${loadingAreas ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              style={{ minHeight: '44px' }}
            >
              <option value="">
                {loadingAreas ? 'Đang tải khu nuôi...' : 'Chọn khu nuôi'}
              </option>
              {areas.map((area) => {
                const remainingCapacity = area.currentCapacity || 0; // Dung lượng còn trống
                const maxCapacity = area.maxCapacity || 0;
                const isFull = remainingCapacity <= 0;
                const currentCount = maxCapacity - remainingCapacity; // Số gà hiện có

                // Tạo tooltip với thông tin đầy đủ
                const fullInfo = `${area.name} (Tối đa: ${maxCapacity}, Đang có: ${currentCount}, Còn trống: ${remainingCapacity})${isFull ? ' - ĐẦY' : ''}`;

                return (
                  <option
                    key={area._id}
                    value={area.name}
                    disabled={(!isEditMode && isFull)}
                    title={fullInfo}
                    className={`
                      text-sm
                      ${(!isEditMode && isFull) ? 'bg-gray-100 text-gray-400' : ''}
                      ${!(!isEditMode && isFull) ? 'hover:bg-green-50' : ''}
                    `}
                  >
                    {formatAreaOption(area)}
                    {!isEditMode && isFull && ' - ĐẦY'}
                  </option>
                );
              })}
            </select>

            <div className="mt-2 text-xs text-gray-500">
              <p>Hover vào tùy chọn để xem thông tin đầy đủ</p>
            </div>

            {shouldShowError('barn') && (
              <p className="text-red-500 text-xs mt-1">{errors.barn}</p>
            )}
            {areaError && (
              <p className="text-red-500 text-xs mt-1">{areaError}</p>
            )}
            {areas.length === 0 && !loadingAreas && (
              <p className="text-yellow-600 text-xs mt-1">
                Không có khu nuôi nào khả dụng
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-8 gap-3 pt-4 border-t">
          <button
            className="px-6 py-2.5 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors text-gray-700"
            onClick={onClose}
            type="button"
          >
            Hủy
          </button>
          <button
            className="px-6 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            type="button"
            disabled={loadingAreas || !selectedArea}
          >
            {loadingAreas ? 'Đang tải...' : (isEditMode ? 'Cập nhật' : 'Tạo đàn')}
          </button>
        </div>
      </div>
    </div>
  );
}