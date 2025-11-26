import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import { v4 as uuidv4 } from "uuid";

const { DataTypes } = Sequelize;

// Chat sessions
const ChatSession = db.define(
  "chat_sessions",
  {
    chat_session_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    user_id: { type: DataTypes.STRING },
    session_token: { type: DataTypes.STRING(120) },
    source: {
      type: DataTypes.ENUM("web", "admin", "pos", "whatsapp", "telegram", "messenger", "ig", "api"),
      allowNull: false,
      defaultValue: "web",
    },
    status: { type: DataTypes.ENUM("active", "closed"), defaultValue: "active", allowNull: false },
    title: { type: DataTypes.STRING(200) },
    assigned_to: { type: DataTypes.STRING },
    is_human_handover: { type: DataTypes.BOOLEAN, defaultValue: false },
    related_order_id: { type: DataTypes.STRING },
    last_message_at: { type: DataTypes.DATE },
    started_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    ended_at: { type: DataTypes.DATE },
    metadata_json: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["status", "last_message_at"] },
      { fields: ["user_id", "status"] },
      { fields: ["session_token"] },
      { fields: ["assigned_to"] },
      { fields: ["related_order_id"] },
    ],
  }
);

// Chat messages
const ChatMessage = db.define(
  "chat_messages",
  {
    message_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    chat_session_id: { type: DataTypes.STRING, allowNull: false },
    sender_type: { type: DataTypes.ENUM("user", "bot", "agent", "system"), allowNull: false },
    sender_id: { type: DataTypes.STRING },
    message_type: { type: DataTypes.ENUM("text", "image", "file", "event"), defaultValue: "text" },
    message_text: { type: DataTypes.TEXT },
    attachments_json: { type: DataTypes.TEXT },
    intent: { type: DataTypes.STRING(120) },
    confidence: { type: DataTypes.DECIMAL(4, 3) },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    read_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false, indexes: [{ fields: ["chat_session_id", "created_at"] }, { fields: ["sender_type"] }, { fields: ["intent"] }] }
);

// Context variables (session memory)
const ChatContextVariable = db.define(
  "chat_context_variables",
  {
    context_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    chat_session_id: { type: DataTypes.STRING, allowNull: false },
    key: { type: DataTypes.STRING(100), allowNull: false },
    value_json: { type: DataTypes.TEXT, allowNull: false },
    expires_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { unique: true, fields: ["chat_session_id", "key"] },
      { fields: ["chat_session_id"] },
      { fields: ["expires_at"] },
    ],
  }
);

// Session events
const ChatSessionEvent = db.define(
  "chat_session_events",
  {
    event_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    chat_session_id: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM(
        "session_started",
        "handover_to_agent",
        "agent_joined",
        "agent_left",
        "session_closed",
        "rating_submitted"
      ),
      allowNull: false,
    },
    payload_json: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false, indexes: [{ fields: ["chat_session_id", "created_at"] }, { fields: ["type"] }] }
);

// Intents
const ChatbotIntent = db.define(
  "chatbot_intents",
  {
    intent_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

const ChatbotIntentTrainingPhrase = db.define(
  "chatbot_intent_training_phrases",
  {
    phrase_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    intent_id: { type: DataTypes.STRING, allowNull: false },
    phrase: { type: DataTypes.TEXT, allowNull: false },
    locale: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "id" },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false, indexes: [{ fields: ["intent_id"] }, { fields: ["locale"] }] }
);

const ChatbotResponse = db.define(
  "chatbot_responses",
  {
    response_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    intent_id: { type: DataTypes.STRING, allowNull: false },
    response: { type: DataTypes.TEXT, allowNull: false },
    is_rich_content: { type: DataTypes.BOOLEAN, defaultValue: false },
    payload_json: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

// Entities
const ChatbotEntity = db.define(
  "chatbot_entities",
  {
    entity_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

const ChatbotEntityValue = db.define(
  "chatbot_entity_values",
  {
    value_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    entity_id: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.STRING(200), allowNull: false },
    synonyms_json: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false, indexes: [{ fields: ["entity_id"] }, { fields: ["value"] }] }
);

// Knowledge base
const ChatbotKnowledgeBase = db.define(
  "chatbot_knowledge_base",
  {
    kb_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    category: { type: DataTypes.STRING(120) },
    question: { type: DataTypes.TEXT, allowNull: false },
    answer: { type: DataTypes.TEXT, allowNull: false },
    tags: { type: DataTypes.STRING(255) },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

// Feedback
const ChatbotFeedback = db.define(
  "chatbot_feedback",
  {
    feedback_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    chat_session_id: { type: DataTypes.STRING, allowNull: false },
    message_id: { type: DataTypes.STRING },
    is_helpful: { type: DataTypes.BOOLEAN, allowNull: false },
    comment: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false, indexes: [{ fields: ["chat_session_id"] }, { fields: ["message_id"] }] }
);

// Quick replies
const ChatbotQuickReply = db.define(
  "chatbot_quick_replies",
  {
    quick_reply_id: { type: DataTypes.STRING, defaultValue: () => uuidv4(), primaryKey: true },
    label: { type: DataTypes.STRING(120), allowNull: false },
    payload_text: { type: DataTypes.STRING(255), allowNull: false },
    locale: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "id" },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

// Intra-domain relations only (cross-domain is wired in models/index.js)
const defineChatbotRelations = () => {
  ChatSession.hasMany(ChatMessage, { foreignKey: "chat_session_id", onDelete: "CASCADE" });
  ChatMessage.belongsTo(ChatSession, { foreignKey: "chat_session_id" });

  ChatSession.hasMany(ChatContextVariable, { foreignKey: "chat_session_id", onDelete: "CASCADE" });
  ChatContextVariable.belongsTo(ChatSession, { foreignKey: "chat_session_id" });

  ChatSession.hasMany(ChatSessionEvent, { foreignKey: "chat_session_id", onDelete: "CASCADE" });
  ChatSessionEvent.belongsTo(ChatSession, { foreignKey: "chat_session_id" });

  ChatSession.hasMany(ChatbotFeedback, { foreignKey: "chat_session_id", onDelete: "CASCADE" });
  ChatbotFeedback.belongsTo(ChatSession, { foreignKey: "chat_session_id" });

  ChatMessage.hasMany(ChatbotFeedback, { foreignKey: "message_id", onDelete: "SET NULL" });
  ChatbotFeedback.belongsTo(ChatMessage, { foreignKey: "message_id" });

  ChatbotIntent.hasMany(ChatbotIntentTrainingPhrase, { foreignKey: "intent_id", onDelete: "CASCADE" });
  ChatbotIntentTrainingPhrase.belongsTo(ChatbotIntent, { foreignKey: "intent_id" });

  ChatbotIntent.hasMany(ChatbotResponse, { foreignKey: "intent_id", onDelete: "CASCADE" });
  ChatbotResponse.belongsTo(ChatbotIntent, { foreignKey: "intent_id" });

  ChatbotEntity.hasMany(ChatbotEntityValue, { foreignKey: "entity_id", onDelete: "CASCADE" });
  ChatbotEntityValue.belongsTo(ChatbotEntity, { foreignKey: "entity_id" });
};

export {
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
};
