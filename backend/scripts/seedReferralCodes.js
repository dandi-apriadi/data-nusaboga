import { ReferralCode } from "../models/index.js";

export async function seedReferralCodes() {
  try {
    // Check if codes already exist
    const existingCount = await ReferralCode.count();
    if (existingCount > 0) {
      console.log("Referral codes already seeded, skipping...");
      return;
    }

    const codes = [
      {
        code: "NUSA10",
        type: "percent",
        value: 10,
        description: "Diskon 10% untuk semua produk",
        is_active: true,
        usage_limit: 100,
        min_order_amount: 50000,
      },
      {
        code: "NUSA50K",
        type: "fixed",
        value: 50000,
        description: "Potongan Rp50.000 untuk pembelian minimal Rp200.000",
        is_active: true,
        usage_limit: 50,
        min_order_amount: 200000,
      },
      {
        code: "WELCOME15",
        type: "percent",
        value: 15,
        description: "Diskon 15% untuk pengguna baru",
        is_active: true,
        usage_limit: 200,
        min_order_amount: 100000,
      }
    ];

    await ReferralCode.bulkCreate(codes);
    console.log("✅ Referral codes seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding referral codes:", error);
  }
}