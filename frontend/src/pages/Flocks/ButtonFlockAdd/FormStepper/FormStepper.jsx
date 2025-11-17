function FormStepper({ currentStep }) {
  return (
    <>
      <div className="flex items-center justify-center w-full  py-6">
        {/* Bước 1 */}
        <div className="flex flex-col items-center">
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              currentStep >= 1
                ? "bg-primary text-primary-foreground"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            1
          </span>
        </div>

        {/* Đường kẻ 1-2 */}
        <div
          className={`flex-1 h-0.5 ${
            currentStep > 1 ? "bg-primary" : "bg-gray-200"
          }`}
        />

        {/* Bước 2 */}
        <div className="flex flex-col items-center">
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              currentStep >= 2
                ? "bg-primary text-primary-foreground"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            2
          </span>
        </div>

        {/* Đường kẻ 2-3 */}
        <div
          className={`flex-1 h-0.5 ${
            currentStep > 2 ? "bg-primary" : "bg-gray-200"
          }`}
        />

        {/* Bước 3 */}
        <div className="flex flex-col items-center">
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              currentStep >= 3
                ? "bg-primary text-primary-foreground"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            3
          </span>
        </div>
      </div>
    
    </>
  );
}
export default FormStepper;
