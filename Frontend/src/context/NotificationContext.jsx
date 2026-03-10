import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../services/apiClient';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [settings, setSettings] = useState({
        notify_messages: true,
        notify_bookings: true,
        notify_payments: true,
        sound_enabled: true
    });
    
    // Use refs to avoid dependency cycle in interval
    const notificationsRef = useRef(notifications);
    const settingsRef = useRef(settings);
    
    useEffect(() => {
        notificationsRef.current = notifications;
        settingsRef.current = settings;
    }, [notifications, settings]);

    // Handle token storage changes
    useEffect(() => {
        const handleAuthChange = () => {
            const newToken = localStorage.getItem('token');
            setToken(newToken);
            setIsAuthenticated(!!newToken);
        };

        window.addEventListener('storage', handleAuthChange);
        window.addEventListener('authChange', handleAuthChange);

        return () => {
            window.removeEventListener('storage', handleAuthChange);
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, []);

    const playNotificationSound = useCallback((type) => {
        if (!settingsRef.current.sound_enabled) return;
        
        // Use a clear bell notification sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.play().catch(err => console.warn('Audio play failed:', err));
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated || !token) return;
        try {
            const res = await apiFetch("/notifications");
            if (res.ok) {
                const data = await res.json();
                
                // Compare with current to trigger sound for NEW unreads
                const currentUnreadIds = new Set(notificationsRef.current.filter(n => !n.is_read).map(n => n.id));
                const newUnreads = data.notifications.filter(n => !n.is_read && !currentUnreadIds.has(n.id));
                
                if (newUnreads.length > 0) {
                    playNotificationSound(newUnreads[0].type);
                }

                setNotifications(data.notifications);
                setUnreadCount(data.unread_count);
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    }, [isAuthenticated, token, playNotificationSound]);

    const fetchSettings = useCallback(async () => {
        if (!isAuthenticated || !token) return;
        try {
            const res = await apiFetch("/notifications/settings");
            if (res.ok) {
                const data = await res.json();
                setSettings(data.settings);
            }
        } catch (err) {
            console.error('Failed to fetch notification settings', err);
        }
    }, [isAuthenticated, token]);

    const updateSettings = async (newSettings) => {
        try {
            const res = await apiFetch("/notifications/settings", {
                method: 'PUT',
                body: JSON.stringify(newSettings)
            });
            if (res.ok) {
                setSettings(prev => ({ ...prev, ...newSettings }));
            }
        } catch (err) {
            console.error('Failed to update notification settings', err);
        }
    };

    const markAsRead = async (id) => {
        try {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            
            await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
        } catch (err) {
            console.error('Failed to mark notification as read', err);
            fetchNotifications(); // Revert
        }
    };

    const markAllAsRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            
            await apiFetch("/notifications/read-all", { method: 'PUT' });
        } catch (err) {
            console.error('Failed to mark all as read', err);
            fetchNotifications(); // Revert
        }
    };

    const markByTypeAsRead = async (type) => {
        try {
            // Optimistic update
            const affectedCount = notifications.filter(n => n.type === type && !n.is_read).length;
            if (affectedCount === 0) return;

            setNotifications(prev => prev.map(n => n.type === type ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - affectedCount));
            
            await apiFetch("/notifications/read-by-type", { 
                method: 'PUT',
                body: JSON.stringify({ type })
            });
        } catch (err) {
            console.error(`Failed to mark notifications of type ${type} as read`, err);
            fetchNotifications(); // Revert
        }
    };

    useEffect(() => {
        let intervalId;
        if (isAuthenticated && token) {
            fetchSettings();
            fetchNotifications();
            // Poll for notifications every 15 seconds
            intervalId = setInterval(fetchNotifications, 15000);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isAuthenticated, token, fetchSettings, fetchNotifications]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            settings,
            markAsRead,
            markByTypeAsRead,
            updateSettings,
            fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
