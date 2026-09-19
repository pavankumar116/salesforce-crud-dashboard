import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const checkAuthStatus = async () => {
  const response = await axios.get(
    `${API_URL}/auth/status`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const loginWithSalesforce = () => {
  window.location.href = `${API_URL}/auth/salesforce`;
};