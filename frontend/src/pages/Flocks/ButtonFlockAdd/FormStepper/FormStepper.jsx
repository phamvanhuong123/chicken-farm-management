import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import FormStep1 from "../FormStep1/FormStep1.jsx";
import FormStep2 from "../FormStep2/FormStep2.jsx";
import FormStep3 from "../FormStep3/FormStep3.jsx";
import { Button } from "~/components/ui/button";
import axios from "axios";
import { useSelector } from "react-redux";

function FormStepper({ onClose,addFlockData }) {
  const user = useSelector((state) => state.auth.user);
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      supplier: "",
      speciesId: "",
      initialCount: "",
      avgWeight: "",
      price: "",
      totalCost: "",
      areaId: "",
      note: "",
      ownerId : user.id // tạm thời hardcode ownerId
    },
  });
  const { getValues } = methods;
  const [currentStep, setCurrentStep] = useState(1);
  const [success, setSuccess] = useState(false);

  // NEXT STEP
  const nextStep = async () => {
    if (currentStep === 1) {
      const isValid = await methods.trigger([
        "supplier",
        "speciesId",
        "quantity",
        "avgWeight",
      ]);
      if (!isValid) return; // Không hợp lệ → không cho qua step 2
    }

    if (currentStep === 2) {
      const isValid = await methods.trigger([
        "price",
        "areaId",
        "note"
      ]);
      if (!isValid) return; // không cho qua Step 3
    }

    // Nếu hợp lệ → next step
    setCurrentStep((prev) => prev + 1);
  };

  // PREV STEP
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  // SUBMIT
  const onSubmit = async () => {
    const finalValues = getValues();
    const res = await axios.post("http://localhost:8071/v1/flocks", finalValues);
    console.log("data : ", res);
    addFlockData(res.data?.data);
    setSuccess(true);

    methods.reset();
    setCurrentStep(1);

    setTimeout(() => {
      setSuccess(false);
      onClose?.();
    }, 1500);
  };
  console.log("RERENDER FORM STEPPER");

  return (
    <>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
      >
        ✕
      </button>

      {/* Success message */}
      {success && (
        <div className="w-full text-center bg-green-100 text-green-700 p-3 rounded mb-4">
          Thêm mới thành công!
        </div>
      )}

      {/* STEP INDICATOR */}
      <div className="flex items-center justify-center w-full py-6">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center w-full">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm 
                ${currentStep >= num ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}
            >
              {num}
            </span>

            {num < 3 && (
              <div
                className={`flex-1 h-0.5 ${currentStep > num ? "bg-primary" : "bg-gray-200"
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* FORM CONTENT */}
      <FormProvider {...methods}>
        {currentStep === 1 && <FormStep1 />}
        {currentStep === 2 && <FormStep2 />}
        {currentStep === 3 && <FormStep3 />}
      </FormProvider>

      {/* BUTTONS */}
      <div className="flex justify-between mt-6">
        {currentStep > 1 ? (
          <Button variant="secondary" onClick={prevStep}>
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
            onClick={methods.handleSubmit(onSubmit)}
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
