import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import axios from "~/apis/index";
import { useSelector } from "react-redux";

import StepBasicInfo from "./StepBasicInfo";
import StepCostArea from "./StepCostArea";
import StepConfirm from "./StepConfirm";
import { financeApi } from "~/apis/financeApi";

export default function FlockCreateModal({ onClose, addFlockData }) {
  const user = useSelector((state) => state.auth.user);
  const [step, setStep] = useState(1);

  // state thông báo
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      importDate: "",
      supplierName: "",
      speciesId: "",
      initialCount: "",
      avgWeight: "",
      price: "",
      areaId: "",
      note: "",
      ownerId: user?.id,
    },
  });

  // chuyển bước
  const nextStep = async () => {
    let fields = [];

    if (step === 1) {
      fields = [
        "importDate",
        "supplierName",
        "speciesId",
        "initialCount",
        "avgWeight",
      ];
    }

    if (step === 2) {
      fields = ["price", "areaId", "note"];
    }

    const ok = await methods.trigger(fields);
    if (ok) setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  // submit
  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload = {
      speciesId: data.speciesId,
      initialCount: Number(data.initialCount),
      avgWeight: Number(data.avgWeight),
      price: Number(data.price),
      areaId: data.areaId,
      note: data.note,
      ownerId: data.ownerId,
      // Thêm trạng thái mặc định
      status: "Raising",
      currentCount: Number(data.initialCount)
    };

    try {
      const res = await axios.post(
        "http://localhost:8071/v1/flocks",
        payload
      );

      addFlockData?.(res.data.data);

      // thông báo trong modal
      setSuccessMsg("Tạo đàn gà thành công và đã cập nhật khu nuôi!");

      // đóng modal sau 1.5s
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        "Không thể tạo đàn mới, vui lòng thử lại"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Trong hàm onSubmitWithAreaUpdate
  const onSubmitWithAreaUpdate = async (data) => {
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Lấy thêm thông tin khu nuôi từ form
    const areaCurrentCount = data.areaCurrentCount || 0;
    const areaCapacity = data.areaCapacity || 0;

    // QUAN TRỌNG: Đảm bảo areaStatus có giá trị hợp lệ
    let areaStatus = data.areaStatus || "ACTIVE";
    // Nếu không có giá trị hợp lệ trong danh sách, mặc định là ACTIVE
    const validStatuses = ["ACTIVE", "EMPTY", "MAINTENANCE", "INCIDENT"];
    if (!validStatuses.includes(areaStatus)) {
      areaStatus = "ACTIVE";
    }

    const areaName = data.areaName || "";

    const payload = {
      speciesId: data.speciesId,
      initialCount: Number(data.initialCount),
      avgWeight: Number(data.avgWeight),
      price: Number(data.price),
      areaId: data.areaId,
      note: data.note,
      ownerId: data.ownerId,
      importDate: data.importDate,
      supplierName: data.supplierName,
      // Thêm thông tin khu nuôi để BE kiểm tra
      areaCurrentCount: Number(areaCurrentCount),
      areaCapacity: Number(areaCapacity),
      areaStatus: areaStatus, // Đảm bảo có giá trị hợp lệ
      areaName: areaName
    };

    console.log("📤 Sending payload to /flocks/with-area:", payload);

    try {
      // Sử dụng API mới có cập nhật khu nuôi
      const res = await axios.post("/flocks", payload);

      addFlockData?.(res.data.data);

      // Thông báo trong modal
      setSuccessMsg("Tạo đàn gà thành công! Đã cập nhật số lượng khu nuôi.");
      //Thêm giao dịch
      const result = await financeApi.createTransaction({
        date : new Date(),
        type : "expense",
        category : "Khác",
        amount: Number(res?.data?.data?.currentCount) *Number(res?.data?.data?.price) ,
        flockId: res?.data?.data?._id || null,
        description: "Nhập giống gà mới",
      })
      console.log(result.data)
      // Đóng modal sau 1.5s
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("❌ Error creating flock with area update:", err.response?.data);

      // Xử lý lỗi cụ thể
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        "Không thể tạo đàn mới, vui lòng thử lại";

      setErrorMsg(errorMessage);

      // Nếu lỗi do sức chứa, quay lại bước 2 để chọn khu khác
      if (errorMessage.includes("đã đầy") ||
        errorMessage.includes("chỗ trống") ||
        errorMessage.includes("sức chứa")) {
        // Tự động quay lại bước 2 sau 2 giây
        setTimeout(() => {
          setStep(2);
        }, 2000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm mới: Xử lý submit dựa trên lựa chọn
  const handleSubmit = async (data) => {
    // Kiểm tra nếu có areaId thì dùng hàm mới, không thì dùng hàm cũ
    
    if (data.areaId) {
       await onSubmitWithAreaUpdate(data);
       
      
    } else {
      await onSubmit(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[720px] rounded-lg p-6 relative">
        {/* Header */}
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Thêm đàn gà mới</h2>
          <button onClick={onClose} className="text-xl cursor-pointer">
            ✕
          </button>
        </div>

        {/* Thông báo */}
        {successMsg && (
          <div className="mb-4 p-3 rounded bg-green-100 text-green-700 text-sm">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Step */}
        <div className="flex gap-6 mb-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white
                ${step >= n ? "bg-green-500" : "bg-gray-300"}`}
              >
                {n}
              </div>
              <span className="text-sm">
                {n === 1 && "Thông tin cơ bản"}
                {n === 2 && "Chi phí & Khu vực"}
                {n === 3 && "Xác nhận"}
              </span>
            </div>
          ))}
        </div>

        {/* Form */}
        <FormProvider {...methods}>
          {step === 1 && <StepBasicInfo />}
          {step === 2 && <StepCostArea />}
          {step === 3 && <StepConfirm />}
        </FormProvider>

        {/* Footer */}
        <div className="flex justify-between mt-6">
          <button
            className="px-4 py-2 border rounded cursor-pointer disabled:cursor-not-allowed"
            onClick={step === 1 ? onClose : prevStep}
            disabled={submitting}
          >
            {step === 1 ? "Hủy" : "Quay lại"}
          </button>

          {step < 3 ? (
            <button
              className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer"
              onClick={nextStep}
              disabled={submitting}
            >
              Tiếp tục
            </button>
          ) : (
            <>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer disabled:cursor-not-allowed"
                onClick={methods.handleSubmit(handleSubmit)}
                disabled={submitting}
                title="Tạo đàn và cập nhật khu nuôi"
              >
                {submitting ? "Đang tạo..." : "Tạo & Cập nhật khu"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}