import apiClient from "../apiClient";
import { WeatherForecast } from "../../Models/weatherForecast";
import { handleError } from "../../Helpers/ErrorHandler";

export const FetchWeather = async () => {
  try {
    const response = await apiClient.get<WeatherForecast[]>(`/weatherforecast`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
