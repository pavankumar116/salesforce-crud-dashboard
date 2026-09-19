import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getRecords = async (objectName, offset = 0) => {
  const response = await axios.get(
    `${API_URL}/api/salesforce/objects/${objectName}?offset=${offset}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const getCreateMetadata = async (objectName) => {
  const response = await axios.get(
    `${API_URL}/api/salesforce/objects/${objectName}/metadata`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const getRecord = async (objectName, id) => {
  const response = await axios.get(
    `${API_URL}/api/salesforce/objects/${objectName}/${id}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const createRecord = async (objectName, data) => {
  const response = await axios.post(
    `${API_URL}/api/salesforce/objects/${objectName}`,
    data,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const updateRecord = async (
  objectName,
  id,
  data
) => {
  const response = await axios.patch(
    `${API_URL}/api/salesforce/objects/${objectName}/${id}`,
    data,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const deleteRecord = async (
  objectName,
  id
) => {
  const response = await axios.delete(
    `${API_URL}/api/salesforce/objects/${objectName}/${id}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};