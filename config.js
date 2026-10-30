// =====================================================================
//  STORE SETTINGS - edit these to match your business
// =====================================================================
const STORE = {
  name: "Snok Enterprise",
  tagline: "Solar panels, inverters, batteries & inverter appliances at retail and wholesale prices",

  // WhatsApp number that receives orders: country code + number, digits only
  // e.g. 0803 123 4567  ->  "2348031234567"
  whatsapp: "2348000000000",

  phone: "+234 800 000 0000",
  email: "orders@example.com",
  address: "Shop address, City, State, Nigeria",
  hours: "Monday – Saturday, 8:00am – 6:00pm",

  // Shown to customers who choose "Bank transfer"
  bank: {
    bankName: "Your Bank Name",
    accountName: "Snok Enterprise",
    accountNumber: "0000000000"
  },

  // ===================================================================
  //  BUY NOW, PAY LATER - your own instalment plans (SAMPLE terms - set your own)
  //  - payments:  how many instalments after the deposit
  //  - every:     "month" or "week"
  //  - deposit:   part paid upfront, e.g. 0.3 = 30%
  //  - markup:    extra added for paying over time, e.g. 0.1 = 10% (0 = no extra)
  //  - collectAfterPaying: true = customer gets the goods after the final payment
  // ===================================================================
  payLater: {
    minimumAmount: 100000,
    plans: [
      {
        id: "save-and-collect",
        name: "Save & Collect",
        description: "Pay small small with no extra cost. We deliver once you've paid in full.",
        payments: 3, every: "month", deposit: 0.2, markup: 0, collectAfterPaying: true
      },
      {
        id: "12-weeks",
        name: "12 Weeks",
        description: "Weekly payments: great for traders and daily earners.",
        payments: 12, every: "week", deposit: 0.3, markup: 0.06
      },
      {
        id: "3-months",
        name: "3 Months",
        description: "Lowest extra cost. Get your goods after the deposit.",
        payments: 3, every: "month", deposit: 0.4, markup: 0.05
      },
      {
        id: "6-months",
        name: "6 Months",
        description: "Our most popular plan for solar systems and inverter ACs.",
        payments: 6, every: "month", deposit: 0.3, markup: 0.1
      },
      {
        id: "9-months",
        name: "9 Months",
        description: "Smaller monthly payments for bigger purchases.",
        payments: 9, every: "month", deposit: 0.3, markup: 0.15
      },
      {
        id: "12-months",
        name: "12 Months",
        description: "Smallest monthly payments, spread over a full year.",
        payments: 12, every: "month", deposit: 0.25, markup: 0.2
      }
    ],
    requirements: [
      "Valid ID: NIN slip, driver's licence, voter's card or international passport",
      "Proof of income: last 3 months' payslips or 6 months' bank statement (or business records)",
      "One guarantor with a valid ID and phone number",
      "Recent utility bill or other proof of address",
      "Deposit paid after your application is approved"
    ]
  }
};
