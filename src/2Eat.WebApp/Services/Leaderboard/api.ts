import apiClient from "../apiClient";
import { LeaderboardEntry } from "../../Models/leaderboard";
import { handleError } from "../../Helpers/ErrorHandler";

export const fetchLeaderboard = async () => {
  try {
    const response = await apiClient.get<LeaderboardEntry[]>("/leaderboard");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchLeaderboardEntryById = async (userId: number) => {
  try {
    const response = await apiClient.get<LeaderboardEntry>(
      `/leaderboard/${userId}`
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createLeaderboardEntry = async (entry: LeaderboardEntry) => {
  try {
    const response = await apiClient.post<LeaderboardEntry>(
      "/leaderboard",
      entry
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateLeaderboardEntry = async (
  userId: number,
  entry: LeaderboardEntry
) => {
  try {
    await apiClient.put(`/leaderboard/${userId}`, entry);
  } catch (error) {
    handleError(error);
  }
};

export const deleteLeaderboardEntry = async (userId: number) => {
  try {
    await apiClient.delete(`/leaderboard/${userId}`);
  } catch (error) {
    handleError(error);
  }
};
