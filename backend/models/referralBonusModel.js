import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import { v4 as uuidv4 } from 'uuid';

const { DataTypes } = Sequelize;

/*
  Tracks bonus rewarded to a referral code owner when their code is used.
  This is separate from loyalty_points to allow flexible future aggregation
  and potential different reward types (points, balance, etc.).
*/
const ReferralBonusTransaction = db.define('referral_bonus_transactions', {
  bonus_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
  referral_id: { type: DataTypes.STRING, allowNull: false }, // links to referral_codes.referral_id
  owner_user_id: { type: DataTypes.STRING, allowNull: false }, // user receiving the bonus
  order_id: { type: DataTypes.STRING, allowNull: true }, // optional linkage to the order where code applied
  bonus_percent: { type: DataTypes.DECIMAL(5,2), allowNull: true },
  base_amount: { type: DataTypes.DECIMAL(12,2), allowNull: false, comment: 'Order amount or discount base used for calculation' },
  bonus_amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  currency: { type: DataTypes.STRING(10), defaultValue: 'IDR' },
  status: { type: DataTypes.ENUM('pending','granted','reversed'), defaultValue: 'granted' },
  note: { type: DataTypes.STRING(255) },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  freezeTableName: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['owner_user_id'] },
    { fields: ['referral_id'] },
    { fields: ['order_id'] },
  ]
});

export { ReferralBonusTransaction };
