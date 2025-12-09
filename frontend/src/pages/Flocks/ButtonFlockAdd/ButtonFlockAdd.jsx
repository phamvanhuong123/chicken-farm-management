import { PlusIcon } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

import FormStepper from "./FormStepper/FormStepper";

function ButtonFlockAdd({addFlockData}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDialog = (open) => {
    setIsOpen(open);
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={handleDialog}>
        <AlertDialogTrigger asChild>
          <Button className="bg-green-500 hover:bg-green-600">
            <PlusIcon /> Thêm đàn mới
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent
          className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg 
                     -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 
                     shadow-lg duration-200 max-h-[90vh] overflow-y-auto rounded-lg"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Thêm đàn gà mới</AlertDialogTitle>
          </AlertDialogHeader>

          <FormStepper addFlockData={addFlockData} onClose={() => handleDialog(false)} />
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ButtonFlockAdd;
