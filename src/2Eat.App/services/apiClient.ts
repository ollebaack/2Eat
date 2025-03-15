import axios from "axios";

const hostName = "192.168.0.114";

console.log(`Using host: ${hostName}`);

const apiUrl = `https://${hostName}:7112/api`;

console.log(`Using API URL: ${apiUrl}`);

// Create a new instance of the axios client
const apiClient = axios.create({
  baseURL: apiUrl,
});

apiClient.interceptors.request.use((config) => {
  config.headers["Accept"] = "application/json";
  config.headers["Content-Type"] = "application/json";
  return config;
});

// Export the instance
export default apiClient;
