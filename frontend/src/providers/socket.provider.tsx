'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface SocketContextType {
    socket: Socket | null;
    onlineUsers: Set<string>;
    isAdminOnline: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    onlineUsers: new Set(),
    isAdminOnline: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session, status } = useSession();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [isAdminOnline, setIsAdminOnline] = useState(false);

    useEffect(() => {
        if (status === 'authenticated' && session?.accessToken) {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            const newSocket = io(backendUrl, {
                transports: ['websocket'],
                auth: { token: session.accessToken }
            });

            newSocket.on('connect', () => {
                const user = session.user as any;
                const userId = user._id || user.id;
                const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

                // Báo danh với hệ thống ngay khi kết nối
                newSocket.emit('join_room', { 
                    roomId: isAdmin ? 'admins' : userId, 
                    userId: userId, 
                    isAdmin: isAdmin 
                });

                // Join notification room
                newSocket.emit('notification:join', { userId });
                if (isAdmin) {
                    newSocket.emit('notification:admin_join');
                }
            });

            newSocket.on('online_users_list', (userIds: string[]) => {
                setOnlineUsers(new Set(userIds.map(id => String(id))));
            });

            newSocket.on('user_status_change', (data: { userId: string, status: 'online' | 'offline' }) => {
                setOnlineUsers((prev) => {
                    const next = new Set(prev);
                    if (data.status === 'online') next.add(String(data.userId));
                    else next.delete(String(data.userId));
                    return next;
                });
            });

            newSocket.on('admin_status_change', (data: { status: 'online' | 'offline' }) => {
                setIsAdminOnline(data.status === 'online');
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else if (status === 'unauthenticated') {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [status, session?.accessToken]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, isAdminOnline }}>
            {children}
        </SocketContext.Provider>
    );
};
