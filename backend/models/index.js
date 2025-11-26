import { User } from "./userModel.js";
import { Address } from "./addressModel.js";
import { ProductCategory, Product, ProductImage, InventoryMovement, defineProductRelations } from "./productModel.js";
import { Cart, CartItem, defineCartRelations } from "./cartModel.js";
import { PaymentMethod, ShippingMethod } from "./paymentShippingModel.js";
import { Order, OrderItem, Payment, OrderStatusHistory } from "./orderModel.js";
import { Review, Notification, LoyaltyPoint } from "./engagementModel.js";
import { ReferralCode } from "./referralCodeModel.js";
import { ReferralBonusTransaction } from "./referralBonusModel.js";
import { BlogCategory, BlogPost, BlogTag, BlogPostTag, BlogComment } from "./blogModel.js";
import {
  Wishlist,
  WishlistItem,
  LoyaltyProgram,
  MembershipTier,
  MembershipPromo,
  NotificationTemplate,
  NotificationJob,
  NotificationDelivery,
  PaymentProof,
  defineAuxRelations,
} from "./auxiliaryModel.js";
import {
  ChatSession,
  ChatMessage,
  ChatContextVariable,
  ChatSessionEvent,
  ChatbotIntent,
  ChatbotIntentTrainingPhrase,
  ChatbotResponse,
  ChatbotEntity,
  ChatbotEntityValue,
  ChatbotKnowledgeBase,
  ChatbotFeedback,
  ChatbotQuickReply,
  defineChatbotRelations,
} from "./chatbotModel.js";
import { Testimonial, NewsletterSubscriber } from './testimonialModel.js';
import Banner from './bannerModel.js';
// ...existing code...

const initializeRelations = () => {
  // Intra-domain relations
  defineProductRelations();
  defineCartRelations();
  defineChatbotRelations();
  
  // CartItem-Product relation (PENTING untuk getCart)
  CartItem.belongsTo(Product, { foreignKey: 'product_id' });
  Product.hasMany(CartItem, { foreignKey: 'product_id' });
  
  // ...other relationship setup...
  // Order-OrderItem & Order-User relations for dashboard/report
  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'OrderItems' });
  OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
  
  // OrderItem-Product relation (untuk tracking order details)
  OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
  Product.hasMany(OrderItem, { foreignKey: 'product_id' });
  
  // Order-PaymentMethod relation
  Order.belongsTo(PaymentMethod, { foreignKey: 'payment_method_id' });
  PaymentMethod.hasMany(Order, { foreignKey: 'payment_method_id' });
  
  // Order-Payment relation
  Order.hasMany(Payment, { foreignKey: 'order_id' });
  Payment.belongsTo(Order, { foreignKey: 'order_id' });
  
  // Payment-PaymentMethod relation
  Payment.belongsTo(PaymentMethod, { foreignKey: 'payment_method_id' });
  PaymentMethod.hasMany(Payment, { foreignKey: 'payment_method_id' });
  
  // Order-User relations
  Order.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
  User.hasMany(Order, { foreignKey: 'user_id' });
  
  // Order-Cashier relation (User yang melakukan POS checkout)
  Order.belongsTo(User, { foreignKey: 'cashier_id', as: 'cashier' });
  User.hasMany(Order, { foreignKey: 'cashier_id', as: 'CashierOrders' });
// End of initializeRelations

  // Membership config
  MembershipTier.belongsTo(LoyaltyProgram, { foreignKey: "program_id", onDelete: "CASCADE" });
  LoyaltyProgram.hasMany(MembershipTier, { foreignKey: "program_id" });
  MembershipPromo.belongsTo(LoyaltyProgram, { foreignKey: "program_id", onDelete: "CASCADE" });
  LoyaltyProgram.hasMany(MembershipPromo, { foreignKey: "program_id" });
  MembershipPromo.belongsTo(MembershipTier, { as: "targetTier", foreignKey: "target_tier_id" });

  // Notifications pipeline
  NotificationTemplate.hasMany(NotificationJob, { foreignKey: "template_id", onDelete: "SET NULL" });
  NotificationJob.belongsTo(NotificationTemplate, { foreignKey: "template_id" });
  NotificationJob.hasMany(NotificationDelivery, { foreignKey: "job_id", onDelete: "CASCADE" });
  NotificationDelivery.belongsTo(NotificationJob, { foreignKey: "job_id" });
  NotificationDelivery.belongsTo(User, { foreignKey: "user_id" });
  User.hasMany(NotificationDelivery, { foreignKey: "user_id" });

  // Payment proof
  PaymentProof.belongsTo(Order, { foreignKey: "order_id", onDelete: "CASCADE" });
  Order.hasMany(PaymentProof, { foreignKey: "order_id" });

  // Shipping methods are lookup-only, no direct FK on orders in current schema

  // Chatbot cross-domain relations
  // Link chat sessions to users (optional guest)
  ChatSession.belongsTo(User, { foreignKey: "user_id" });
  User.hasMany(ChatSession, { foreignKey: "user_id" });

  // Assigned agent (admin)
  ChatSession.belongsTo(User, { as: "assignee", foreignKey: "assigned_to" });

  // Related order linkage
  ChatSession.belongsTo(Order, { foreignKey: "related_order_id" });
  Order.hasMany(ChatSession, { foreignKey: "related_order_id" });

  // Message sender (optional)
  ChatMessage.belongsTo(User, { foreignKey: "sender_id" });
  User.hasMany(ChatMessage, { foreignKey: "sender_id" });

  // Referral code owner (optional linking to user who gets bonus)
  ReferralCode.belongsTo(User, { as: 'owner', foreignKey: 'owner_user_id' });
  User.hasMany(ReferralCode, { as: 'ownedReferralCodes', foreignKey: 'owner_user_id' });

  // Referral bonus transactions
  ReferralBonusTransaction.belongsTo(ReferralCode, { foreignKey: 'referral_id' });
  ReferralCode.hasMany(ReferralBonusTransaction, { foreignKey: 'referral_id' });
  ReferralBonusTransaction.belongsTo(User, { as: 'bonusOwner', foreignKey: 'owner_user_id' });
  User.hasMany(ReferralBonusTransaction, { foreignKey: 'owner_user_id' });
  ReferralBonusTransaction.belongsTo(Order, { foreignKey: 'order_id' });
  Order.hasMany(ReferralBonusTransaction, { foreignKey: 'order_id' });
};

// Export all models and relation initializer
export {
  User,
  Address,
  ProductCategory,
  Product,
  ProductImage,
  InventoryMovement,
  Cart,
  CartItem,
  PaymentMethod,
  ShippingMethod,
  Order,
  OrderItem,
  Payment,
  OrderStatusHistory,
  Review,
  Notification,
  LoyaltyPoint,
  ReferralCode,
  ReferralBonusTransaction,
  Wishlist,
  WishlistItem,
  LoyaltyProgram,
  MembershipTier,
  MembershipPromo,
  NotificationTemplate,
  NotificationJob,
  NotificationDelivery,
  PaymentProof,
  // Blog models
  BlogCategory,
  BlogPost,
  BlogTag,
  BlogPostTag,
  BlogComment,
  // Chatbot models
  ChatSession,
  ChatMessage,
  ChatContextVariable,
  ChatSessionEvent,
  ChatbotIntent,
  ChatbotIntentTrainingPhrase,
  ChatbotResponse,
  ChatbotEntity,
  ChatbotEntityValue,
  ChatbotKnowledgeBase,
  ChatbotFeedback,
  ChatbotQuickReply,
  Testimonial,
  NewsletterSubscriber,
  Banner,
  initializeRelations,
};
