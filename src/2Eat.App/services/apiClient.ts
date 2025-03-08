import axios from "axios";
import { Platform } from "react-native";

const hostName = Platform.OS === "web" ? "localhost" : "192.168.0.114";

// Create a new instance of the axios client
const apiClient = axios.create({
  baseURL: `https://${hostName}:7112/api`,
  // Disable SSL verification for development purposes
  // Note: This is not recommended for production
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  },
});

apiClient.interceptors.request.use((config) => {
  config.headers["Accept"] = "application/json";
  config.headers["Content-Type"] = "application/json";
  return config;
});

// Export the instance
export default apiClient;
