import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SmsConsentScreenshot() {
  const [smsConsent, setSmsConsent] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f09] to-[#2a1810] p-8 flex items-center justify-center">
      <Card className="max-w-xl w-full bg-gradient-to-br from-[#2a1810]/90 to-[#1a0f09]/90 border-[#5c4033]/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-[#c4a47c] text-2xl font-serif">Delivery Details</CardTitle>
          <p className="text-[#a0896c] text-sm">Brew & Board Coffee - Order Form</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[#c4a47c]">Contact Phone</Label>
              <Input
                type="tel"
                value="(615) 555-0123"
                readOnly
                className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white"
              />
            </div>
            <div>
              <Label className="text-[#c4a47c]">Contact Email</Label>
              <Input
                type="email"
                value="order@company.com"
                readOnly
                className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white"
              />
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg bg-[#1a0f09]/30 border border-[#5c4033]/30">
            <Checkbox
              id="sms-consent"
              checked={smsConsent}
              onCheckedChange={(checked) => setSmsConsent(checked === true)}
              className="border-[#c4a47c] data-[state=checked]:bg-[#c4a47c] data-[state=checked]:text-[#1a0f09] mt-1"
            />
            <label 
              htmlFor="sms-consent" 
              className="text-sm text-[#a0896c] leading-relaxed cursor-pointer"
            >
              I consent to receive SMS messages from Brew & Board Coffee regarding my order status and delivery updates. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out or HELP for help.
            </label>
          </div>

          <div className="text-center pt-4 border-t border-[#5c4033]/30">
            <p className="text-xs text-[#a0896c]">
              brewandboardcoffee.replit.app
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
