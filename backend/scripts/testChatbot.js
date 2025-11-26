import db from "../config/Database.js";
import openai from "../config/openai.js";
import {
  searchProducts,
  getProductCategories,
  getPopularProducts,
  getLowStockProducts,
  getOrderStatistics,
  searchCustomers,
  getTopSellingProducts
} from "../utils/databaseHelpers.js";

// Test the AI bot reply function
const testAiBotReply = async (text, sessionId = null) => {
  try {
    // Analisis intent dan extract keywords dari pesan user
    const extractKeywords = (text) => {
      const lowerText = text.toLowerCase();
      const keywords = [];
      
      const keywordMap = {
        'produk': ['produk', 'product', 'barang', 'cakalang', 'abon', 'dendeng', 'fufu', 'sambal'],
        'pesanan': ['pesanan', 'order', 'pesan', 'beli', 'transaksi'],
        'harga': ['harga', 'price', 'berapa', 'cost', 'tarif'],
        'customer': ['customer', 'pelanggan', 'user', 'pengguna'],
        'laporan': ['laporan', 'report', 'statistik', 'analisis', 'data'],
        'pengiriman': ['kirim', 'pengiriman', 'ongkir', 'shipping', 'delivery'],
        'kontak': ['kontak', 'hubungi', 'contact', 'customer service'],
      };

      for (const [category, words] of Object.entries(keywordMap)) {
        if (words.some(word => lowerText.includes(word))) {
          keywords.push(category);
        }
      }

      return keywords;
    };

    const keywords = extractKeywords(text);
    let contextData = {};

    console.log(`🔍 Keywords detected: ${keywords.join(', ')}`);

    // Gather relevant data from database based on keywords
    if (keywords.includes('produk') || keywords.includes('cakalang') || keywords.includes('abon')) {
      contextData.products = await searchProducts(text, 5);
      contextData.categories = await getProductCategories();
      contextData.popularProducts = await getPopularProducts(3);
      console.log(`📦 Found ${contextData.products.length} products, ${contextData.categories.length} categories`);
    }

    if (keywords.includes('laporan') || keywords.includes('report') || keywords.includes('statistik')) {
      contextData.topProducts = await getTopSellingProducts(5);
      contextData.orderStats = await getOrderStatistics(30);
      contextData.lowStock = await getLowStockProducts(5);
      console.log(`📊 Loaded statistics data`);
    }

    // Create system prompt with business context
    const systemPrompt = `Anda adalah asisten virtual untuk Lyvia Nusa Boga, perusahaan yang menjual produk olahan cakalang berkualitas tinggi. 

INFORMASI PERUSAHAAN:
- Nama: Lyvia Nusa Boga  
- Produk utama: Abon cakalang, dendeng cakalang, cakalang fufu, sambal cakalang
- Contact: WhatsApp +62 812-3456-7890, Email: info@lyvianusaboga.com
- Jam operasional: 08:00-17:00 WIB (Senin-Sabtu)
- Alamat: Jl. Raya Nusa Boga No. 123, Jakarta Selatan

PERSONALITY GUIDELINES:
- Ramah, profesional, dan helpful
- Gunakan bahasa Indonesia yang sopan
- Selalu berikan informasi yang akurat dari database
- Jika tidak tahu jawaban pasti, arahkan ke customer service
- Gunakan emoji secukupnya untuk membuat respons lebih menarik

DATA CONTEXT YANG TERSEDIA:
${JSON.stringify(contextData, null, 2)}

INSTRUKSI:
1. Jawab pertanyaan user berdasarkan data yang tersedia
2. Jika menampilkan produk, sertakan nama, harga, dan deskripsi singkat
3. Jika menampilkan pesanan, berikan status dan detail yang relevan
4. Jika data tidak tersedia, berikan respons yang membantu dan arahkan ke kontak yang tepat
5. Jawaban maksimal 300 kata dan gunakan format yang mudah dibaca`;

    console.log(`🤖 Calling OpenAI API...`);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "Maaf, terjadi kesalahan dalam memproses permintaan Anda.";

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return "Maaf, sistem sedang mengalami gangguan. Silakan hubungi customer service kami di WhatsApp +62 812-3456-7890.";
  }
};

async function testChatbot() {
  try {
    await db.authenticate();
    console.log("✅ Database connected successfully");

    const testMessages = [
      "Halo, ada produk cakalang apa saja?",
      "Berapa harga abon cakalang?",
      "Produk mana yang paling populer?",
      "test chatbot"
    ];

    for (const message of testMessages) {
      console.log(`\n🗣️ User: "${message}"`);
      console.log(`⏳ Processing...`);
      
      const response = await testAiBotReply(message);
      console.log(`🤖 Bot: ${response}`);
      console.log(`${'='.repeat(80)}`);
    }

    console.log("\n🎉 Chatbot testing completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error testing chatbot:", error);
    process.exit(1);
  }
}

testChatbot();