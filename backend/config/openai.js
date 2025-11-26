import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  // Fail fast on missing key to avoid silent fallbacks and accidental commits of secrets
  throw new Error('OPENAI_API_KEY is not set. Please define it in your environment (.env) before starting the server.');
}

const openai = new OpenAI({ apiKey });

export default openai;