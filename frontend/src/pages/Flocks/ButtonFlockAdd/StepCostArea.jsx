import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { areaApi } from "~/apis/areaApi";

export default function StepCostArea() {
  const {
    register,
    watch,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
  } = useFormContext();

  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAreaDetail, setSelectedAreaDetail] = useState(null);

  const initialCount = watch("initialCount") || 0;
  const price = watch("price") || 0;
  const selectedAreaId = watch("areaId");

  const total = Number(initialCount) * Number(price);

  // Load danh sách khu nuôi
  useEffect(() => {
    areaApi
      .getList()
      .then((res) => {
        let areasData = [];

        // CASE 1: Nếu API trả về { data: [], pagination: {} }
        if (res.data && Array.isArray(res.data.data)) {
          areasData = res.data.data;
        }
        // CASE 2: Nếu API trả về mảng trực tiếp
        else if (Array.isArray(res.data)) {
          areasData = res.data;
        }
        // CASE 3: Cấu trúc khác
        else {
          areasData = findAreasArray(res.data);
        }

        processAreasData(areasData);
      })
      .catch((err) => {
        setAreas([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Hàm tìm mảng khu nuôi trong response
  const findAreasArray = (data) => {
    if (!data) return [];

    const possibleKeys = ['data', 'items', 'result', 'areas', 'list'];

    for (const key of possibleKeys) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }

    // Nếu data là object có id và name, coi như là 1 khu nuôi duy nhất
    if (data.id && data.name) {
      return [data];
    }

    return [];
  };

  // Hàm xử lý dữ liệu khu nuôi
  const processAreasData = (areasData) => {
    if (!Array.isArray(areasData)) {
      setAreas([]);
      return;
    }

    const parsedAreas = areasData.map((area) => {
      // Lấy thông tin cơ bản
      const areaInfo = {
        id: area.id || area._id,
        name: area.name || area.areaName || "Không tên",
        status: area.status || area.state || "Không xác định",
        note: area.note || area.description || "",
      };

      // Tìm thông tin số lượng
      let currentCount = 0;
      let capacity = 0;

      // TÌM TRONG TẤT CẢ CÁC FIELD CÓ THỂ
      Object.entries(area).forEach(([key, value]) => {
        // Nếu field là string có dạng "100/60"
        if (typeof value === 'string' && value.includes('/')) {
          const match = value.match(/(\d+)\s*\/\s*(\d+)/);
          if (match) {
            currentCount = parseInt(match[1]) || 0;
            capacity = parseInt(match[2]) || 0;
          }
        }
        // Nếu field là number và tên gợi ý capacity
        else if (typeof value === 'number') {
          const keyLower = key.toLowerCase();
          if (keyLower.includes('capacity') && !keyLower.includes('current')) {
            capacity = value;
          }
          if (keyLower.includes('current') || keyLower.includes('count')) {
            currentCount = value;
          }
        }
      });

      // Fallback: nếu không tìm thấy qua pattern
      if (!capacity) {
        capacity = area.max_capacity || area.total_capacity || area.capacity || 100;
      }
      if (!currentCount) {
        currentCount = area.current_count || area.currentCount || area.current_quantity || 0;
      }

      // Đảm bảo là số
      capacity = Number(capacity) || 100;
      currentCount = Number(currentCount) || 0;

      return {
        ...areaInfo,
        capacity,
        currentCount,
      };
    });

    setAreas(parsedAreas);
  };

  // Trong useEffect khi chọn khu nuôi
  useEffect(() => {
    if (selectedAreaId) {
      const area = areas.find(a => a.id == selectedAreaId);
      if (area) {
        setSelectedAreaDetail(area);

        // Lưu đầy đủ thông tin khu nuôi vào form để BackEnd xử lý
        setValue("areaId", area.id);
        setValue("areaName", area.name);
        setValue("areaCurrentCount", area.currentCount);
        setValue("areaCapacity", area.capacity);

        // Đảm bảo areaStatus không bị rỗng
        const areaStatusValue = area.status || 'ACTIVE';
        setValue("areaStatus", areaStatusValue);

        // Kiểm tra sức chứa
        const availableSpace = area.capacity - area.currentCount;
        if (initialCount > availableSpace) {
          setError("areaId", {
            type: "manual",
            message: `Không đủ chỗ trống. Chỉ còn ${availableSpace} chỗ`,
          });
        } else {
          clearErrors("areaId");
        }
      }
    } else {
      setSelectedAreaDetail(null);
      // Reset giá trị khi không chọn khu nào
      setValue("areaName", "");
      setValue("areaCurrentCount", 0);
      setValue("areaCapacity", 0);
      setValue("areaStatus", "");
    }
  }, [selectedAreaId, initialCount, setError, clearErrors, setValue]);

  // Filter: Lấy khu nuôi còn đủ sức chứa cho số lượng nhập
  const suitableAreas = areas.filter(area => {
    const availableSpace = area.capacity - area.currentCount;
    return availableSpace >= initialCount && initialCount > 0;
  });

  // Tính toán cho hiển thị
  const totalAfterAdd = selectedAreaDetail ?
    Number(selectedAreaDetail.currentCount) + Number(initialCount) : 0;
  const remainingSpace = selectedAreaDetail ?
    selectedAreaDetail.capacity - totalAfterAdd : 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Giá */}
      <div>
        <label>
          Giá/con (VNĐ) <span className="text-red-500">*</span>
        </label>
        <Input
          type="number"
          {...register("price", {
            required: "Giá nhập bắt buộc",
            min: { value: 1, message: "Giá nhập phải lớn hơn 0." },
          })}
        />
        <p className="text-red-500 text-sm">
          {errors.price?.message}
        </p>
      </div>

      {/* Tổng */}
      <div>
        <label>Tổng chi phí (VNĐ)</label>
        <Input
          readOnly
          value={isNaN(total) ? "0" : total.toLocaleString("vi-VN")}
        />
      </div>

      {/* Khu nuôi */}
      <div className="col-span-2">
        <label>
          Khu nuôi <span className="text-red-500">*</span>
          <span className="text-xs text-gray-500 ml-2">
            (Chỉ hiển thị khu còn đủ sức chứa)
          </span>
        </label>

        <select
          {...register("areaId", {
            required: "Vui lòng chọn khu nuôi.",
            validate: {
              capacityCheck: (value) => {
                if (!value) return true;
                const area = areas.find(a => a.id == value);
                if (!area) return "Khu nuôi không tồn tại";

                const availableSpace = area.capacity - area.currentCount;
                if (initialCount > availableSpace) {
                  return `Không đủ chỗ trống. Chỉ còn ${availableSpace} chỗ`;
                }

                return true;
              }
            }
          })}
          disabled={loading || initialCount === 0}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">
            {loading ? "Đang tải khu nuôi..." :
              initialCount === 0 ? "Vui lòng nhập số lượng trước" :
                suitableAreas.length === 0 ? "Không có khu nào đủ chỗ" :
                  `Chọn khu nuôi (${suitableAreas.length} khu đủ chỗ)`}
          </option>

          {suitableAreas.map((area) => {
            const availableSpace = area.capacity - area.currentCount;
            const isDisabled = initialCount > availableSpace;

            return (
              <option
                key={area.id}
                value={area.id}
                disabled={isDisabled}
                className={isDisabled ? "text-gray-400" : ""}
              >
                {area.name} | Đang có: {area.currentCount}/{area.capacity} | Còn trống: {availableSpace} con
                {isDisabled && " - Không đủ sức chứa"}
              </option>
            );
          })}
        </select>

        {initialCount === 0 && !loading && (
          <p className="text-amber-600 text-sm mt-1">
            Vui lòng nhập số lượng gà trước khi chọn khu nuôi.
          </p>
        )}

        {initialCount > 0 && suitableAreas.length === 0 && !loading && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 text-sm">
              Không có khu nuôi nào đủ chỗ cho {initialCount} con gà.
            </p>
          </div>
        )}

        <p className="text-red-500 text-sm">
          {errors.areaId?.message}
        </p>

        {/* Hiển thị thông tin chi tiết */}
        {selectedAreaDetail && (
          <div className="mt-3 p-3 border rounded-lg bg-blue-50">
            <h4 className="font-semibold text-gray-700 mb-2">
              📍 {selectedAreaDetail.name}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-600">Sức chứa tối đa:</span> {selectedAreaDetail.capacity} con</div>
              <div><span className="text-gray-600">Đang có:</span> {selectedAreaDetail.currentCount} con</div>
              <div><span className="text-gray-600">Chỗ trống hiện tại:</span> {selectedAreaDetail.capacity - selectedAreaDetail.currentCount} con</div>
              <div><span className="text-gray-600">Số lượng nhập thêm:</span> {initialCount} con</div>
              <div><span className="text-gray-600">Trạng thái:</span>
                <span className="ml-1 font-medium">
                  {selectedAreaDetail.status}
                </span>
              </div>
              <div><span className="text-gray-600">Sau khi nhập:</span>
                <span className={`font-semibold ml-1 ${totalAfterAdd > selectedAreaDetail.capacity
                  ? 'text-red-600'
                  : totalAfterAdd === selectedAreaDetail.capacity
                    ? 'text-amber-600'
                    : 'text-green-600'
                  }`}>
                  {selectedAreaDetail.currentCount} + {initialCount} = {totalAfterAdd} con
                </span>
              </div>
            </div>

            {totalAfterAdd > selectedAreaDetail.capacity ? (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                <strong>Không đủ chỗ: </strong>
                Hiện có {selectedAreaDetail.currentCount} con + Nhập {initialCount} con = {totalAfterAdd} con
                (Vượt quá sức chứa {selectedAreaDetail.capacity} con)
              </div>
            ) : totalAfterAdd === selectedAreaDetail.capacity ? (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm">
                <strong>Đầy sức chứa: </strong>
                Hiện có {selectedAreaDetail.currentCount} con + Nhập {initialCount} con = {totalAfterAdd} con
                (Đạt tối đa sức chứa)
              </div>
            ) : (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                <strong>Đủ chỗ: </strong>
                Hiện có {selectedAreaDetail.currentCount} con + Nhập {initialCount} con = {totalAfterAdd} con
                (Sẽ còn {remainingSpace} chỗ trống)
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ghi chú */}
      <div className="col-span-2">
        <label>Ghi chú</label>
        <textarea
          {...register("note")}
          className="w-full border rounded px-3 py-2"
        />
        
      </div>
    </div>
  );
}