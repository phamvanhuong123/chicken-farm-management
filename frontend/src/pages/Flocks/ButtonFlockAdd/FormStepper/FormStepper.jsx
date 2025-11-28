import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import FormStep1 from "../FormStep1/FormStep1.jsx";
import FormStep2 from "../FormStep2/FormStep2.jsx";
import FormStep3 from "../FormStep3/FormStep3.jsx";
import { Button } from "~/components/ui/button";

function FormStepper({ onClose, onSaved }) {
  const methods = useForm({
    defaultValues: {
      importDate: "",
      supplier: "",
      breed: "",
      quantity: "",
      avgWeight: "",
      price: "",
      totalCost: "",
      area: "",
      note: "",
    },
  });

  const { getValues } = methods;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState(false);

  const nextStep = () => {
    const values = getValues();
    setFormData((prev) => ({ ...prev, ...values }));
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const onSubmit = async () => {
    const finalValues = { ...formData, ...getValues() };

    // ============================
    // 🔥 Map đúng dữ liệu backend
    // ============================
    const payload = {
  initialCount: Number(finalValues.quantity),
  speciesId: finalValues.breed,
  areaId: finalValues.area,
  ownerId: "admin01",   // nếu bạn có auth thì đổi
  avgWeight: Number(finalValues.avgWeight || 0),
  price: Number(finalValues.totalCost || 0),
  note: finalValues.note?.trim() || "",
};


    console.log("PAYLOAD SENT TO BACKEND:", payload);

    try {
      const res = await fetch("http://localhost:8071/v1/flocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log("BACKEND RESPONSE:", json);

if (!res.ok) {
  console.log("BACKEND ERROR:", json);
  alert(json.message || "Không thể thêm đàn mới!");
  return;
}


      // === Hiện thông báo thành công ===
      setSuccess(true);

      // Gửi đàn mới ra ngoài component cha
      if (onSaved) onSaved(json.data);

      // Reset form + đóng popup
      methods.reset();
      setCurrentStep(1);

      setTimeout(() => {
        setSuccess(false);
        onClose?.();
      }, 1500);

    } catch (error) {
      console.error("BACKEND ERROR:", error);
      alert("Không thể kết nối máy chủ!");
    }
  };

  return (
    <>
      {/* Nút X để đóng */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
      >
        ✕
      </button>

      {/* Thông báo */}
      {success && (
        <div className="w-full text-center bg-green-100 text-green-700 p-3 rounded mb-4">
          Thêm mới thành công!
        </div>
      )}

      {/* Step UI */}
      <div className="flex items-center justify-center w-full py-6">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center w-full">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                currentStep >= num
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {num}
            </span>
            {num < 3 && (
              <div
                className={`flex-1 h-0.5 ${
                  currentStep > num ? "bg-primary" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Nội dung form */}
      <FormProvider {...methods}>
        {currentStep === 1 && <FormStep1 />}
        {currentStep === 2 && <FormStep2 />}
        {currentStep === 3 && <FormStep3 formData={formData} />}
      </FormProvider>

      {/* Nút điều hướng */}
      <div className="flex justify-between mt-6">
        {currentStep > 1 ? (
          <Button variant="secondary" onClick={prevStep} className="cursor-pointer">
            Quay lại
          </Button>
        ) : (
          <div></div>
        )}

        {currentStep < 3 ? (
          <Button
            onClick={nextStep}
            className="bg-green-500 hover:bg-green-600 cursor-pointer"
          >
            Tiếp tục
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            className="bg-green-500 hover:bg-green-600 cursor-pointer"
          >
            Hoàn tất
          </Button>
        )}
      </div>
    </>
  );
}

export default FormStepper;
