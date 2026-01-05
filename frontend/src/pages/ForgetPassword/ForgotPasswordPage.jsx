import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import StepEmail from "./StepEmail";
import StepOtp from "./StepOtp";
import StepResetPassword from "./StepResetPassword";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Quên mật khẩu</CardTitle>
      </CardHeader>

      <CardContent>
        {step === 1 && (
          <StepEmail
            onSuccess={(email) => {
              setEmail(email);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <StepOtp
            email={email}
            onSuccess={(otp) => {
              setOtp(otp)
              setStep(3)
            }}
          />
        )}

        {step === 3 && (
          <StepResetPassword
            email={email}
            otp={otp}
          />
        )}
      </CardContent>
    </Card>
  );
}
