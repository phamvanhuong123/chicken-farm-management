import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import FormStep1 from "../FormStep1/FormStep1.jsx";
import FormStep2 from "../FormStep2/FormStep2.jsx";
import FormStep3 from "../FormStep3/FormStep3.jsx";
import { Button } from "~/components/ui/button";

function FormStepper({ onClose }) {
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
  const [success, setSuccess] = useState(false); // ⭐ Thêm state báo thành công

  const nextStep = () => {
    const values = getValues();
    setFormData((prev) => ({ ...prev, ...values }));
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const onSubmit = () => {
    const finalValues = { ...formData, ...getValues() };
    console.log("FINAL SUBMIT:", finalValues);

    // Hiện thông báo trong UI
    setSuccess(true);

    // Reset form
    methods.reset();
    setCurrentStep(1);

    // Tự tắt thông báo sau 2 giây
    setTimeout(() => {
      setSuccess(false);
      onClose?.();
    }, 2000);
  };

  return (
    <>
      {/* Thông báo thành công */}
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
          <Button variant="secondary" onClick={prevStep}>
            Quay lại
          </Button>
        ) : (
          <div></div>
        )}

        {currentStep < 3 ? (
          <Button onClick={nextStep} className="bg-green-500 hover:bg-green-600">
            Tiếp tục
          </Button>
        ) : (
          <Button onClick={onSubmit} className="bg-green-500 hover:bg-green-600">
            Hoàn tất
          </Button>
        )}
      </div>
    </>
  );
}

export default FormStepper;
