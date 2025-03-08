import { isAxiosError } from "axios";
import apiClient from "../../../services/apiClient";
import { Recipe } from "../models/recipe";

export const fetchRecipes = async () => {
  try {
    const response = await apiClient.get<Recipe[]>("/recipes");
    console.log(response);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw error;
    } else {
      throw error;
    }
  }
};
