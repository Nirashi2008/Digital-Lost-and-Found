
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications/");
      setNotifications(response.data.results ?? response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Notifications load nahi hui.");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleNotificationClick = async (item) => {
    try {
      if (!item.is_read) {
        await api.patch(`/notifications/${item.id}/`, {
          is_read: true,
        });

        setNotifications((previous) =>
          previous.map((notification) =>
            notification.id === item.id
              ? { ...notification, is_read: true }
              : notification
          )
        );
      }

      if (item.link) {
        window.location.assign(item.link);
      }
    } catch (err) {
      console.error(err);
      setError("Notification update nahi hui.");
    }
  };

  return (
    <div className="notifications-wrapper">
      <button
        type="button"
        className="notification-bell"
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) fetchNotifications();
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <strong>Notifications</strong>
            <button type="button" onClick={fetchNotifications}>
              Refresh
            </button>
          </div>

          {error && <p className="notification-error">{error}</p>}

          {!error && notifications.length === 0 && (
            <p className="no-notifications">
              Abhi koi notification nahi hai.
            </p>
          )}

          {notifications.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`notification-item ${
                item.is_read ? "read" : "unread"
              }`}
              onClick={() => handleNotificationClick(item)}
            >
              <strong>{item.title}</strong>
              <span>{item.message}</span>
              <small>
                {new Date(item.created_at).toLocaleString()}
              </small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
