import { PaymentMethod } from '../models/index.js';

// Default payment methods to ensure exist
const DEFAULT_METHODS = [
  {
    code: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Transfer manual ke rekening perusahaan',
  },
  {
    code: 'cod',
    name: 'Cash on Delivery',
    description: 'Bayar tunai saat barang diterima',
  },
  {
    code: 'qris',
    name: 'QRIS',
    description: 'Pembayaran via QRIS all-channel',
  },
  {
    code: 'ewallet',
    name: 'E-Wallet',
    description: 'Dompet digital (OVO/DANA/LinkAja dsb)',
  },
];

export async function ensurePaymentMethods(logger = console) {
  for (const def of DEFAULT_METHODS) {
    try {
      const existing = await PaymentMethod.findOne({ where: { code: def.code } });
      if (!existing) {
        await PaymentMethod.create({ ...def, fee_type: 'none', fee_amount: 0, active: true });
        logger.log(`[Seed][PaymentMethod] Created ${def.code}`);
      } else if (!existing.active || existing.name !== def.name) {
        await existing.update({ name: def.name, description: def.description, active: true });
        logger.log(`[Seed][PaymentMethod] Updated ${def.code}`);
      }
    } catch (e) {
      logger.warn(`[Seed][PaymentMethod] Failed ensuring ${def.code}:`, e.message);
    }
  }
}

// Allow running directly: node backend/scripts/ensurePaymentMethods.js
if (process.argv[1] && process.argv[1].includes('ensurePaymentMethods.js')) {
  (async () => {
    try {
      const { default: dotenv } = await import('dotenv');
      dotenv.config();
      const { default: db } = await import('../config/Database.js');
      await db.authenticate();
      console.log('[Seed] DB connected');
      await ensurePaymentMethods();
      console.log('[Seed] Done');
      process.exit(0);
    } catch (e) {
      console.error('[Seed] Error', e);
      process.exit(1);
    }
  })();
}
