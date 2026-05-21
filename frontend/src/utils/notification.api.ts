import { sendRequest } from "@/utils/api";

export interface INotification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
}

export const getMyNotificationsApi = (accessToken: string) => {
  return sendRequest<IBackendRes<INotification[]>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getUnreadCountApi = (accessToken: string) => {
  return sendRequest<IBackendRes<{ count: number }>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications/unread-count`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const markAsReadApi = (id: string, accessToken: string) => {
  return sendRequest<IBackendRes<INotification>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications/${id}/read`,
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const markAllAsReadApi = (accessToken: string) => {
  return sendRequest<IBackendRes<{ modifiedCount: number }>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications/read-all`,
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
