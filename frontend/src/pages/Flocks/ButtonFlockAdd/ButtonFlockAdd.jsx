import { PlusIcon } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import FormStep1 from "./FormStep1/FormStep1"
import FormStep2 from "./FormStep2/FormStep2"
import FormStep3 from "./FormStep3/FormStep3"
import FormStepper from "./FormStepper/FormStepper"
function ButtonFlockAdd(){
    const [step, setStep] = useState(1)
    const [isOpen,setIsOpen] = useState(false)
    

    const handleNextStep = () =>{
        if (step < 3){
            setStep(step + 1)
        }
    }
    const handlePrevStep = () =>{
        if (step > 1) {
            setStep(step - 1)
        }
    }
    //Xử lí đóng mở form
    const handleDialog = (isOpen) =>{
        if(!isOpen){
        setStep(1)
        }
        setIsOpen(isOpen)
    }
    return <>
        <AlertDialog open={isOpen} >
      <AlertDialogTrigger asChild>
        <Button onClick={()=> handleDialog(true)}  className={'bg-green-400 hover:bg-green-500 cursor-pointer'}> <PlusIcon/>Thêm đàn mới</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Thêm đàn gà mới</AlertDialogTitle>
          <FormStepper currentStep={step}/>
          <AlertDialogDescription asChild>
           <div>
              {step === 1 && <FormStep1 />}
              {step === 2 && <FormStep2 />}
              {step === 3 && <FormStep3 />}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={'sm:justify-between w-full'}>
        {step > 1 ? <Button className={'cursor-pointer'} onClick={handlePrevStep} variant='outline' >Quay lại</Button> :  <Button className={'cursor-pointer'} onClick={()=> handleDialog(false)} variant='outline' >Huỷ</Button>}
        
        {step === 3 ? <Button onClick={handleNextStep} className={'bg-green-400 hover:bg-green-500 cursor-pointer'} >Hoàn tất</Button> :  <Button onClick={handleNextStep} className={'bg-green-400 hover:bg-green-500 cursor-pointer'} >Tiếp tục</Button> }
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
}

export default ButtonFlockAdd