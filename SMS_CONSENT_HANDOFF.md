# SMS Consent Checkbox - Implementation Handoff

## Purpose
This document provides instructions for adding SMS consent checkboxes to forms that collect phone numbers, required for Twilio toll-free verification compliance.

## Twilio Compliance Requirements

To pass Twilio's toll-free verification (avoiding errors 30498 and 30513), every form that collects a phone number for SMS notifications must include:

1. **Visible consent checkbox** with explicit opt-in language
2. **Required legal disclosures**: message frequency, data rates, STOP/HELP instructions
3. **Publicly accessible screenshot** of the form for Twilio submission

## Standard Consent Language

Use this exact language for the checkbox label:

```
I consent to receive SMS messages from Brew & Board Coffee regarding my order status and delivery updates. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out or HELP for help.
```

## Implementation Pattern

### 1. Add State Variable
```tsx
const [smsConsent, setSmsConsent] = useState(false);
```

### 2. Import Checkbox Component
```tsx
import { Checkbox } from "@/components/ui/checkbox";
```

### 3. Add Checkbox UI (after phone input)
```tsx
<div className="flex items-start space-x-3 p-4 rounded-lg bg-[#1a0f09]/30 border border-[#5c4033]/30">
  <Checkbox
    id="sms-consent"
    checked={smsConsent}
    onCheckedChange={(checked) => setSmsConsent(checked === true)}
    className="border-[#c4a47c] data-[state=checked]:bg-[#c4a47c] data-[state=checked]:text-[#1a0f09] mt-1"
    data-testid="checkbox-sms-consent"
  />
  <label 
    htmlFor="sms-consent" 
    className="text-sm text-[#a0896c] leading-relaxed cursor-pointer"
  >
    I consent to receive SMS messages from Brew & Board Coffee regarding my order status and delivery updates. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out or HELP for help.
  </label>
</div>
```

### 4. Include in Form Submission
When submitting the form, include the `smsConsent` boolean value. Only send SMS notifications if `smsConsent === true`.

## Forms That Need This Checkbox

Add the SMS consent checkbox to any form that:
- Collects a phone number
- Will be used to send SMS notifications (order updates, delivery alerts, etc.)

### Currently Implemented:
- [x] `client/src/pages/one-off-order.tsx` - One-off order form

### May Need Implementation:
- [ ] Registration/signup forms (if SMS verification is added)
- [ ] Account settings (if users can update phone preferences)
- [ ] Virtual host invite forms
- [ ] Recurring order forms

## Twilio Verification Submission

When submitting to Twilio for toll-free verification:

### Opt-in Type
Select: **Web Form**

### Opt-in Workflow Description
```
Customers opt-in to receive SMS notifications during the order checkout process on our web application (brewandboardcoffee.replit.app). When placing an order, customers enter their phone number and must check a checkbox that states: "I consent to receive SMS messages from Brew & Board Coffee regarding my order status and delivery updates. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out or HELP for help." No messages are sent without this explicit consent.
```

### Opt-in Confirmation Message (first SMS sent after opt-in)
```
Brew & Board Coffee: You're now signed up for order updates! Msg frequency varies. Msg & data rates may apply. Reply HELP for help, STOP to cancel.
```

### Sample Messages
```
Your Brew & Board order #1234 is confirmed for delivery at 9:00 AM.
Your order is on the way! Driver ETA: 10 minutes.
Your order has been delivered. Enjoy!
```

### Opt-in Image URL
Take a screenshot of the order form showing the consent checkbox and host it publicly. Submit that URL to Twilio.

## Backend Considerations

When storing orders or user preferences:
- Store `smsConsent` as a boolean field
- Only trigger SMS notifications if consent is true
- Log consent timestamp for compliance records

## Testing Checklist
- [ ] Checkbox renders correctly with proper styling
- [ ] Checkbox state updates on click
- [ ] Consent value is included in form submission
- [ ] SMS is only sent when consent is true
- [ ] Form works on mobile devices
