import { ENV } from "@/config/env";
import axios from "axios";

const axiosClient = axios.create({
  baseURL: ENV.BASE_URL,
});

export default axiosClient;
