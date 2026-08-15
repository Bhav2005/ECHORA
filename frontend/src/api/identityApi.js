import axios from 'axios';

const IDENTITY_API_URL = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: IDENTITY_API_URL,
});

const parseAxiosError = (error) => {
  if (!error) return 'Request failed. Please try again.';
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return `Identity service not reachable at ${IDENTITY_API_URL}. Please start the identity backend.`;
  }
  if (error.response?.data?.error) return error.response.data.error;
  if (error.message) return error.message;
  return 'Request failed. Please try again.';
};

export const requestOtp = async (email) => {
  try {
    const response = await api.post('/api/otp/request', { email });
    return response.data;
  } catch (error) {
    throw new Error(parseAxiosError(error));
  }
};

export const verifyOtp = async (email, code) => {
  try {
    const response = await api.post('/api/otp/verify', { email, code });
    return response.data;
  } catch (error) {
    throw new Error(parseAxiosError(error));
  }
};

export const getPublicKey = async () => {
  const response = await api.get('/api/blindsign/public-key');
  return response.data;
};

export const requestSignature = async (sessionToken, blindedMessage) => {
  const response = await api.post('/api/blindsign/sign', 
    { blindedMessage },
    {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    }
  );
  return response.data;
};
