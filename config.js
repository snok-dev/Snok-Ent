// =====================================================================
//  STORE SETTINGS - edit these to match your business
// =====================================================================
const STORE = {
  name: "Snok Enterprise",
  tagline: "Solar panels, batteries, inverters & energy-saving appliances for UK homes and businesses",

  // WhatsApp number that receives orders: country code + number, digits only
  // e.g. 07700 900123  ->  "447700900123"
  whatsapp: "447700900000",

  phone: "+44 20 0000 0000",
  email: "orders@example.com",
  address: "Unit 1, Example Business Park, Town, AB1 2CD, United Kingdom",
  hours: "Monday – Friday 9:00am – 5:30pm, Saturday 9:00am – 1:00pm",

  // Shown in the footer when filled in, e.g. "Snok Enterprise Ltd",
  // "Registered in England & Wales No. 12345678", "GB123456789"
  legalName: "",
  companyNumber: "",
  vatNumber: "",

  // Shown to customers who choose "Bank transfer"
  bank: {
    bankName: "Your Bank Name",
    accountName: "Snok Enterprise",
    sortCode: "00-00-00",
    accountNumber: "00000000"
  },

  // ===================================================================
  //  BUY NOW, PAY LATER - your own instalment plans (SAMPLE terms - set your own)
  //  - payments:  how many monthly instalments after the deposit
  //  - deposit:   part paid upfront, e.g. 0.2 = 20%
  //  - markup:    extra added for paying over time, e.g. 0.1 = 10% (0 = interest-free)
  //  - collectAfterPaying: true = customer gets the goods after the final payment
  //
  //  IMPORTANT (UK): offering credit to consumers is regulated by the
  //  Financial Conduct Authority (FCA). Plans with interest or fees need
  //  FCA authorisation. Interest-free, fee-free plans with no more than
  //  12 payments over 12 months may be exempt, but get advice before you
  //  change these terms. Save & Collect (pay before you receive) is not credit.
  // ===================================================================
  payLater: {
    minimumAmount: 250,
    plans: [
      {
        id: "save-and-collect",
        name: "Save & Collect",
        description: "Put down 10%, then save monthly over 6 months with no credit check. We deliver once you've paid in full.",
        payments: 6, every: "month", deposit: 0.1, markup: 0, collectAfterPaying: true
      },
      {
        id: "pay-in-3",
        name: "Pay in 3",
        description: "Split the cost into 3 equal payments: one today, then two monthly. Great for smaller purchases.",
        payments: 2, every: "month", deposit: 0.34, markup: 0
      },
      {
        id: "6-months",
        name: "6 Months 0%",
        description: "Our most popular plan for solar and battery systems.",
        payments: 6, every: "month", deposit: 0.2, markup: 0
      },
      {
        id: "10-months",
        name: "10 Months 0%",
        description: "Smaller monthly payments for larger purchases.",
        payments: 10, every: "month", deposit: 0.2, markup: 0
      },
      {
        id: "12-months",
        name: "12 Months 0%",
        description: "Lowest monthly payments, spread over a full year.",
        payments: 11, every: "month", deposit: 0.25, markup: 0
      },
      {
        id: "business-12",
        name: "Business 12 Months",
        description: "For registered businesses: spread the cost of equipment over a year.",
        payments: 11, every: "month", deposit: 0.1, markup: 0, businessOnly: true
      }
    ],
    requirements: [
      "Photo ID: passport or UK driving licence",
      "Proof of address from the last 3 months (utility bill, council tax bill or bank statement)",
      "Proof of income: last 3 months' payslips or bank statements (businesses: recent accounts or business bank statements)",
      "A UK bank account to pay your monthly instalments by standing order",
      "Deposit paid once your application is approved"
    ]
  }
};
