import axios from "axios";

export function runner(tokenKey) {
  const ax = axios.create();
  ax.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(tokenKey)
      const headers = config.headers;
      if (token && headers) {
        headers['Authorization'] = 'Bearer ' + token;
      }
      config.headers = headers;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    })
  return ax;
}