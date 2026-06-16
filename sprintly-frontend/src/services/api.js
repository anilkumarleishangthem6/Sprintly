import axios from 'axios';

// base url for our backend api
const API = axios.create({
  baseURL: 'https://sprintly-backend-jnv8.onrender.com',
});

// attach token to every request if user is logged in
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;