import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://eaglehub.onrender.com', // Your actual API base URL
    withCredentials: true,
});

export default instance;
