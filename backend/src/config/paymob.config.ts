import dotenv from 'dotenv';
dotenv.config();

export const paymobConfig = {
  apiKey: process.env.PAYMOB_API_KEY || 'test_api_key',
  integrationId: process.env.PAYMOB_INTEGRATION_ID || '123456',
  iframeId: process.env.PAYMOB_IFRAME_ID || '789012',
  hmacSecret: process.env.PAYMOB_HMAC_SECRET || 'test_hmac',
  baseUrl: 'https://accept.paymob.com/api',
};
