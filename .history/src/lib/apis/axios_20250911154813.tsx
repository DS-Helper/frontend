import axios, { AxiosInstance } from "axios";

export const instance: AxiosInstance = axios.create({
  baseURL: "https://your-weddy.pe.kr",
  withCredentials: true,
});