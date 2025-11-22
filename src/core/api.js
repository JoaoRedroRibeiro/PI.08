import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('RB_AT')
    config.headers = {
        ...config.headers,
        "Authorization": `Bearer ${token}`
    }
    return config
})

export { api }