// eslint-disable-next-line no-unused-vars
import React from "react";

// eslint-disable-next-line react/prop-types
const Notification = ({ message }) => (
  <div id="notification" className="message">
    {message}
  </div>
);

export const displayNotification = (text) => {
  const notificationEl = document.getElementById("notification");
  notificationEl.textContent = text;
  notificationEl.classList.add("show");
  setTimeout(() => notificationEl.classList.remove("show"), 3000);
};

export default Notification;
