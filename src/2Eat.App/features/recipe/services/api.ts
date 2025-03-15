import { isAxiosError } from "axios";
import apiClient from "../../../services/apiClient";
import { Recipe } from "../models/recipe";

export const fetchRecipes = async () => {
  try {
    const response = await apiClient.get<Recipe[]>("/recipes");
    console.log("response", response);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      console.log("config: ", error.config);
      console.log("request: ", error.request);
      console.log("request response: ", error.request._response);
      throw error;
    } else {
      console.error("Unexpected error:", error);
      throw error;
    }
  }
};
