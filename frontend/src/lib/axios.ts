import axios from "axios"
import { useAuthStore } from "../store/authStore"

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    console.log(config.url + " Token is " + JSON.stringify(token))
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log(config.headers)
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // useAuthStore.getState().logout();
    }
    return Promise.reject(error)
  }
)
