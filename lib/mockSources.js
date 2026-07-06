// Simulated "Sync Gmail" / "Sync WhatsApp" payloads. In a real integration
// these would come from the Gmail API / WhatsApp Business API. For this MVP
// we mock the connector and send the raw text straight into the same
// extraction pipeline real messages would use (see app/api/sync-*/route.js).

export const MOCK_GMAIL_MESSAGES = [
  {
    subject: "Invoice #INV-2291 - Teak Wood Panels",
    from: "accounts@abctraders.in",
    body: "Hi, please find attached invoice INV-2291 for the teak wood panels delivered on the 2nd. Total amount due is Rs. 48,500. Kindly process payment within 7 days to avoid a late fee.",
  },
  {
    subject: "Following up - delivery delay",
    from: "rakesh@rakeshtraders.com",
    body: "Hello, our sofa set order was supposed to arrive 4 days ago. Could you please tell us the new expected delivery date? We have a customer waiting.",
  },
  {
    subject: "Purchase order for showroom fit-out",
    from: "purchasing@vermaenterprises.com",
    body: "We would like to place a purchase order for 15 display cabinets and 8 counter units for our new showroom. Please send a formal quotation with GST breakup.",
  },
];

export const MOCK_WHATSAPP_MESSAGES = [
  {
    from: "+91 98765 43210 (Sharma Furniture)",
    body: "Bhaiya quotation bhej dena 20 dining chairs walnut finish ke liye, hotel order hai, jaldi chahiye",
  },
  {
    from: "+91 91234 56789 (Site Supervisor - Anil)",
    body: "Sir Saturday subah showroom site pe milna hai contractor ke saath, timing confirm kar dijiye",
  },
  {
    from: "+91 99887 76655 (Verma Enterprises)",
    body: "Payment kar diya hai pichle order ka, receipt bhej dijiye please",
  },
];
