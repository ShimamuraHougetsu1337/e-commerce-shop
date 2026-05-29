import { create } from 'zustand';
import {
  getMyNotificationsApi,
  getUnreadCountApi,
  markAsReadApi,
  markAllAsReadApi,
  INotification,
} from '@/utils/notification.api';

interface NotificationStore {
  notifications: INotification[];
  unreadCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (accessToken: string, current?: number, pageSize?: number) => Promise<void>;
  fetchUnreadCount: (accessToken: string) => Promise<void>;
  markAsRead: (id: string, accessToken: string) => Promise<void>;
  markAllAsRead: (accessToken: string) => Promise<void>;
  addNotification: (notification: INotification) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,

  fetchNotifications: async (accessToken: string, current = 1, pageSize = 10) => {
    set({ isLoading: true, error: null });
    try {
      const res = await getMyNotificationsApi(accessToken, current, pageSize);
      if (res?.data) {
        set({
          notifications: res.data.result || [],
          currentPage: res.data.meta.current,
          totalCount: res.data.meta.total,
          totalPages: res.data.meta.pages,
          isLoading: false
        });
      } else {
        set({ notifications: [], isLoading: false });
      }
    } catch {
      set({ isLoading: false, error: 'Đã xảy ra lỗi khi tải thông báo' });
    }
  },

  fetchUnreadCount: async (accessToken: string) => {
    try {
      const res = await getUnreadCountApi(accessToken);
      if (res) {
        // Hỗ trợ cả cấu trúc mới { count } và số nguyên thô từ backend cũ
        const rawData = res.data;
        let count = 0;
        if (typeof rawData === 'object' && rawData !== null && 'count' in rawData) {
          count = Number(rawData.count);
        } else if (typeof rawData === 'number') {
          count = rawData;
        }
        set({ unreadCount: Number.isNaN(count) ? 0 : count });
      }
    } catch (err) {
      console.error('Error fetching unread notification count:', err);
    }
  },

  markAsRead: async (id: string, accessToken: string) => {
    try {
      const res = await markAsReadApi(id, accessToken);
      if (res?.statusCode === 200 || res?.statusCode === 201) {
        // Cập nhật trạng thái thông báo trong danh sách
        const updatedList = get().notifications.map((notif) =>
          notif._id === id ? { ...notif, isRead: true } : notif
        );
        // Giảm unreadCount nếu nó lớn hơn 0
        const currentUnread = get().unreadCount || 0;
        set({
          notifications: updatedList,
          unreadCount: Math.max(0, currentUnread - 1),
        });
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  },

  markAllAsRead: async (accessToken: string) => {
    try {
      const res = await markAllAsReadApi(accessToken);
      if (res?.statusCode === 200 || res?.statusCode === 201) {
        const updatedList = get().notifications.map((notif) => ({
          ...notif,
          isRead: true,
        }));
        set({
          notifications: updatedList,
          unreadCount: 0,
        });
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  },

  addNotification: (notification: INotification) => {
    // Tránh bị trùng lặp thông báo
    const exists = get().notifications.some((n) => n._id === notification._id);
    if (exists) return;

    const newList = [notification, ...get().notifications];
    set({
      notifications: newList,
      unreadCount: (get().unreadCount || 0) + 1,
      totalCount: (get().totalCount || 0) + 1,
    });
  },
}));
