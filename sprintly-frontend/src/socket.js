import { io } from 'socket.io-client';

const socket = io('https://sprintly-backend-jnv8.onrender.com', {
  autoConnect: false,
});

export default socket;