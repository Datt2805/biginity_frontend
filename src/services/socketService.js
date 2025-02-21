import { io } from "https://cdn.socket.io/4.8.0/socket.io.esm.min.js";

const hostSocket = `http://${window.location.hostname}:${window.location.port}`;
const socket = io(hostSocket, {
  auth: {
    token: localStorage.getItem("token"),
  },
});

export const configureSocket = (handlers) => {
  Object.entries(handlers).forEach(([event, handler]) => {
    socket.on(event, handler);
  });
  return socket;
};

export default socket;
