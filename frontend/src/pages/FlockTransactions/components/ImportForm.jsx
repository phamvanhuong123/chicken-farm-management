import { useState, useEffect } from "react";
import { areaApi } from "../../../apis/areaApi"; 

export default function ImportForm({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    importDate: "",
    supplier: "",
    breed: "",
    quantity: "",
    avgWeight: "",
    barn: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [areaError, setAreaError] = useState(null);

  useEffect(() => {
    const fetchAreas = async () => {
      setLoadingAreas(true);
      setAreaError(null);
      try {
        const response = await areaApi.getList();
        
        if (response.data.status === "success" && response.data.data) {
          setAreas(response.data.data);
        } else {
          setAreas([]);
          setAreaError("Không thể tải danh sách khu nuôi");
        }
      } catch (error) {
        console.error('Error fetching areas:', error);
        setAreas([]);
        setAreaError("Lỗi khi tải danh sách khu nuôi");
      } finally {
        setLoadingAreas(false);
      }
    };

    fetchAreas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'importDate':
        if (!value.trim()) {
          error = 'Ngày nhập không được để trống';
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

    // Validate Ngày nhập
    if (!form.importDate.trim()) {
      newErrors.importDate = 'Ngày nhập không được để trống';
    }

    // Validate Nhà cung cấp
    if (!form.supplier.trim()) {
      newErrors.supplier = 'Nhà cung cấp không được để trống';
    } else if (form.supplier.trim().length < 2) {
      newErrors.supplier = 'Nhà cung cấp phải có ít nhất 2 ký tự';
    }

    // Validate Giống
    if (!form.breed.trim()) {
      newErrors.breed = 'Giống không được để trống';
    }

    // Validate Số lượng
    if (!form.quantity) {
      newErrors.quantity = 'Số lượng không được để trống';
    } else if (form.quantity <= 0) {
      newErrors.quantity = 'Số lượng phải lớn hơn 0';
    } else if (form.quantity > 100000) {
      newErrors.quantity = 'Số lượng không được vượt quá 100,000';
    }

    // Validate Trọng lượng TB
    if (!form.avgWeight) {
      newErrors.avgWeight = 'Trọng lượng TB không được để trống';
    } else if (form.avgWeight <= 0) {
      newErrors.avgWeight = 'Trọng lượng TB phải lớn hơn 0';
    } else if (form.avgWeight > 1000) {
      newErrors.avgWeight = 'Trọng lượng TB không được vượt quá 1000 kg';
    }

    // Validate Khu nuôi
    if (!form.barn.trim()) {
      newErrors.barn = 'Khu nuôi không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    // Mark all fields as touched when submitting
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

  // Helper function to check if should show error
  const shouldShowError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[480px] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-4">
          Nhập chuồng mới
        </h2>

        {/* Input fields */}
        <div className="flex flex-col gap-5">
          {/* Ngày nhập */}
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
              className={`border p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                shouldShowError('importDate') ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {shouldShowError('importDate') && (
              <p className="text-red-500 text-xs mt-1">{errors.importDate}</p>
            )}
          </div>

          {/* Nhà cung cấp */}
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
              className={`border p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                shouldShowError('supplier') ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {shouldShowError('supplier') && (
              <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>
            )}
          </div>

          {/* Giống */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giống <span className="text-red-500">*</span>
            </label>
            <select 
              name="breed" 
              value={form.breed}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`border p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                shouldShowError('breed') ? 'border-red-500' : 'border-gray-300'
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

          {/* Số lượng và Trọng lượng */}
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
                max="100000"
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyPress={handleSubmitWithEnter}
                className={`border p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  shouldShowError('quantity') ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {shouldShowError('quantity') && (
                <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
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
                className={`border p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  shouldShowError('avgWeight') ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {shouldShowError('avgWeight') && (
                <p className="text-red-500 text-xs mt-1">{errors.avgWeight}</p>
              )}
            </div>
          </div>

          {/* Khu nuôi - Lấy từ API areas */}
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
              className={`border p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                shouldShowError('barn') ? 'border-red-500' : 'border-gray-300'
              } ${loadingAreas ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {loadingAreas ? 'Đang tải khu nuôi...' : 'Chọn khu nuôi'}
              </option>
              {areas.map((area) => (
                <option key={area._id} value={area.name}>
                  {area.name} {area.maxCapacity ? `(Tối đa: ${area.maxCapacity})` : ''}
                </option>
              ))}
            </select>
            {shouldShowError('barn') && (
              <p className="text-red-500 text-xs mt-1">{errors.barn}</p>
            )}
            {areaError && (
              <p className="text-red-500 text-xs mt-1">{areaError}</p>
            )}
            {areas.length === 0 && !loadingAreas && !areaError && (
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
            disabled={loadingAreas}
          >
            {loadingAreas ? 'Đang tải...' : 'Tạo đàn'}
          </button>
        </div>
      </div>
    </div>
  );
}