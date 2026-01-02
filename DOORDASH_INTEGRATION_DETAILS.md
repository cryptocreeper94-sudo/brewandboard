# DoorDash Drive API Integration Details

**Company:** Brew & Board Coffee  
**Domain:** brewandboard.coffee  
**Contact:** [Your contact info]  
**Date:** January 2026

---

## Webhook Configuration

**Webhook URL:**  
```
https://brewandboard.coffee/api/doordash/webhook
```

**Supported Events:**
- `DELIVERY_STATUS_UPDATED` - Delivery status changes (created, confirmed, picked_up, delivered, cancelled)
- `DASHER_CONFIRMED` - Driver assigned to delivery
- `DASHER_APPROACHING_PICKUP` - Driver near pickup location
- `DASHER_APPROACHING_DROPOFF` - Driver near delivery location

---

## API Endpoints (Our Implementation)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/doordash/quote` | POST | Request delivery quote |
| `/api/doordash/delivery` | POST | Create new delivery |
| `/api/doordash/delivery/:id` | GET | Get delivery status |
| `/api/doordash/delivery/:id/cancel` | POST | Cancel delivery |
| `/api/doordash/webhook` | POST | Receive status updates |

---

## Required Credentials (From DoorDash)

We need the following credentials to complete integration:

1. **Developer ID** - Your DoorDash developer account ID
2. **Key ID** - API key identifier
3. **Signing Secret** - For JWT authentication and webhook verification

---

## Business Details

**Service Type:** B2B Coffee & Breakfast Catering  
**Delivery Items:** Coffee, pastries, breakfast boards, beverages  
**Service Area:** Nashville, TN metropolitan area  
**Typical Order Value:** $50 - $500  
**Delivery Window:** Scheduled deliveries with 2-hour minimum lead time

---

## Compliance Notes

- No restricted items (tobacco, alcohol, cannabis, etc.)
- Food items only - coffee, tea, juice, pastries, breakfast items
- All orders are pre-scheduled for business meetings
- Contactless delivery supported

---

## Technical Contact

For integration questions:  
**Email:** [Your technical contact email]  
**Developer Portal:** brewandboard.coffee/developers (internal only)

---

## Next Steps

1. Obtain sandbox credentials for testing
2. Configure webhook URL in DoorDash portal
3. Test delivery flow in sandbox environment
4. Apply for production certification
