import db from "../config/Database.js";
import { ChatbotQuickReply } from "../models/chatbotModel.js";

const quickReplies = [
  {
    label: "🐟 Lihat Produk",
    payload_text: "produk cakalang",
    sort_order: 1
  },
  {
    label: "💰 Info Harga",
    payload_text: "harga produk",
    sort_order: 2
  },
  {
    label: "🚚 Info Pengiriman",
    payload_text: "pengiriman",
    sort_order: 3
  },
  {
    label: "📞 Kontak Kami",
    payload_text: "kontak customer service",
    sort_order: 4
  },
  {
    label: "🛒 Cara Pesan",
    payload_text: "cara pesan produk",
    sort_order: 5
  },
  {
    label: "📍 Lokasi Toko",
    payload_text: "alamat toko",
    sort_order: 6
  },
  {
    label: "💳 Metode Pembayaran",
    payload_text: "pembayaran",
    sort_order: 7
  }
];

async function seedQuickReplies() {
  try {
    await db.authenticate();
    console.log("✅ Database connected successfully");

    // Clear existing quick replies
    await ChatbotQuickReply.destroy({ where: {} });
    console.log("🗑️ Cleared existing quick replies");

    // Insert new quick replies
    for (const reply of quickReplies) {
      await ChatbotQuickReply.create(reply);
      console.log(`✅ Added quick reply: ${reply.label}`);
    }

    console.log("🎉 Quick replies seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding quick replies:", error);
    process.exit(1);
  }
}

seedQuickReplies();