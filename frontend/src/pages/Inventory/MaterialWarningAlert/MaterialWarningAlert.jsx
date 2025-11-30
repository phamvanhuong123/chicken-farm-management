import { useState } from "react";
import { AlertTriangle, X, ChevronDown, ChevronUp } from "lucide-react";

function MaterialWarningAlert({ materials }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Lọc vật tư cần cảnh báo
  const warningMaterials = materials.filter(
    (m) => m.statusInfo?.label === "Sắp hết" || m.statusInfo?.label === "Gần hết hạn"
  );

  const almostEmpty = materials.filter((m) => m.statusInfo?.label === "Sắp hết");
  const expiring = materials.filter((m) => m.statusInfo?.label === "Gần hết hạn");

  // Nếu không có cảnh báo nào
  if (warningMaterials.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-green-600 text-xl">✓</span>
        </div>
        <div>
          <p className="text-green-800 font-medium">Tất cả vật tư đều trong giới hạn an toàn.</p>
          <p className="text-green-600 text-sm">Không có vật tư nào cần bổ sung.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
      {/* Header - Click để mở/đóng */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="text-amber-600" size={22} />
          </div>
          <div>
            <p className="text-amber-800 font-medium">
              Thông báo cảnh báo vật tư
            </p>
            <p className="text-amber-600 text-sm">
              Có <span className="font-bold text-red-600">{almostEmpty.length}</span> vật tư sắp hết 
              {expiring.length > 0 && (
                <> và <span className="font-bold text-orange-600">{expiring.length}</span> vật tư gần hết hạn</>
              )}
              . Nhấn để xem chi tiết.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
            {warningMaterials.length} cảnh báo
          </span>
          {isExpanded ? (
            <ChevronUp className="text-amber-600" size={20} />
          ) : (
            <ChevronDown className="text-amber-600" size={20} />
          )}
        </div>
      </div>

      {/* Danh sách vật tư cần bổ sung */}
      {isExpanded && (
        <div className="border-t border-amber-200 p-4 bg-white">
          <h4 className="font-medium text-gray-800 mb-3">Danh sách vật tư cần nhập bổ sung:</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {warningMaterials.map((m) => (
              <div
                key={m._id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  m.statusInfo?.label === "Sắp hết"
                    ? "bg-red-50 border-red-200"
                    : "bg-orange-50 border-orange-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      m.statusInfo?.label === "Sắp hết"
                        ? "bg-red-100 text-red-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {m.statusInfo?.label}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{m.name}</p>
                    <p className="text-sm text-gray-500">
                      {m.type} • {m.storageLocation}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {m.statusInfo?.label === "Sắp hết" ? (
                    <p className="text-sm">
                      Tồn: <span className="font-bold text-red-600">{m.quantity}</span> / Ngưỡng: {m.threshold} {m.unit}
                    </p>
                  ) : (
                    <p className="text-sm">
                      HSD: <span className="font-bold text-orange-600">
                        {new Date(m.expiryDate).toLocaleDateString("vi-VN")}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MaterialWarningAlert;
