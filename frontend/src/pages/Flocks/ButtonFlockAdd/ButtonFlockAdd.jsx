import { PlusIcon } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import FormStepper from "./FormStepper/FormStepper";

function ButtonFlockAdd() {
  const [step, setStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Xử lý đóng mở dialog
  const handleDialog = (open) => {
    if (!open) setStep(1);
    setIsOpen(open);
  };

  return (
    <>
      <AlertDialog open={isOpen}>
        <AlertDialogTrigger asChild>
          <Button
            onClick={() => handleDialog(true)}
            className="bg-green-400 hover:bg-green-500 cursor-pointer"
          >
            <PlusIcon /> Thêm đàn mới
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thêm đàn gà mới</AlertDialogTitle>

            {/* Stepper UI + Nội dung Step nằm trong FormStepper */}
            <FormStepper currentStep={step} onClose={() => handleDialog(false)} />

            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogHeader>

          {/* Footer KHÔNG CÒN RENDER NÚT TRÙNG NỮA */}
          <AlertDialogFooter className="sm:justify-between w-full"></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ButtonFlockAdd;
