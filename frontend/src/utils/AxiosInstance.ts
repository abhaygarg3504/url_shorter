import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/", 
  withCredentials: true
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can customize error handling here
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error("API Error:", error.response.data);
      alert(error.response.data?.message || "API Error occurred.");
    } else if (error.request) {
      // No response received
      console.error("No response from server.");
      alert("No response from server.");
    } else {
      // Something else happened
      console.error("Error:", error.message);
      alert("An error occurred: " + error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
