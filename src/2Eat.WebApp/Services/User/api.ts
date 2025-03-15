import apiClient from "../apiClient";
import { User } from "../../Models/user";
import { handleError } from "../../Helpers/ErrorHandler";

export const fetchUsers = async () => {
  try {
    const response = await apiClient.get<User[]>("/users");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchUserById = async (id: number) => {
  try {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createUser = async (user: User) => {
  try {
    const response = await apiClient.post<User>("/users", user);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateUser = async (id: number, user: User) => {
  try {
    await apiClient.put(`/users/${id}`, user);
  } catch (error) {
    handleError(error);
  }
};

export const deleteUser = async (id: number) => {
  try {
    await apiClient.delete(`/users/${id}`);
  } catch (error) {
    handleError(error);
  }
};
