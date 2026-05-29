'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Layout, List, Avatar, Input, Button, Typography, Space, Flex, Badge } from 'antd';
import { UserOutlined, SendOutlined, MessageOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { useSocket } from '@/providers/socket.provider';
import dayjs from 'dayjs';
import { getAvatarUrl } from '@/utils/user.api';

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

interface IActiveChat {
    _id: string;
    lastMessage: string;
    lastUpdate: string;
    userDetails: {
        name: string;
        email: string;
        avatar?: string;
    };
}

interface IMessage {
    _id?: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt?: string;
}

export default function AdminChatClient({
    initialActiveChats,
    adminId,
    accessToken
}: {
    initialActiveChats: IActiveChat[],
    adminId: string,
    accessToken: string
}) {
    const { socket, onlineUsers } = useSocket();
    const [activeChats, setActiveChats] = useState<IActiveChat[]>(initialActiveChats);
    const [selectedUser, setSelectedUser] = useState<IActiveChat | null>(null);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const isUserOnline = (userId: string) => onlineUsers.has(String(userId));

    useEffect(() => {
        if (!socket) return;

        socket.on('new_message', (message: IMessage) => {
            setMessages((prev) => {
                const isRelevant = String(message.senderId) === String(selectedUser?._id) || String(message.receiverId) === String(selectedUser?._id);
                if (!isRelevant) return prev;
                const exists = prev.some(m => m._id && message._id && m._id === message._id);
                if (exists) return prev;
                return [...prev, message];
            });
            fetchActiveChats();
        });

        return () => {
            socket.off('new_message');
        };
    }, [socket, selectedUser]);

    useEffect(() => {
        if (selectedUser && socket) {
            socket.emit('join_room', { roomId: selectedUser._id });
            fetchChatHistory(selectedUser._id);
        }
    }, [selectedUser, socket]);

    const fetchActiveChats = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chat/active-chats`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const result = await res.json();
        if (result && result.data) setActiveChats(result.data);
    };

    const fetchChatHistory = async (userId: string) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chat/history/${userId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const result = await res.json();
        if (result && result.data) setMessages(result.data);
    };

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputValue.trim() || !socket || !selectedUser || !adminId) return;
        socket.emit('send_message', {
            senderId: adminId,
            receiverId: selectedUser._id,
            content: inputValue,
            roomId: selectedUser._id,
        });
        setInputValue('');
    };

    return (
        <Layout style={{ height: 'calc(100vh - 120px)', background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <Sider width={350} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                    <Title level={4} style={{ margin: 0 }}>Hội thoại hỗ trợ</Title>
                </div>
                <div style={{ height: 'calc(100% - 80px)', overflowY: 'auto' }}>
                    <List
                        dataSource={activeChats.filter(chat => String(chat._id) !== String(adminId))}
                        renderItem={(item) => (
                            <List.Item
                                onClick={() => setSelectedUser(item)}
                                style={{
                                    cursor: 'pointer',
                                    padding: '16px 24px',
                                    transition: 'all 0.3s',
                                    backgroundColor: selectedUser?._id === item._id ? '#e6f4ff' : 'transparent',
                                    borderLeft: selectedUser?._id === item._id ? '4px solid #1677ff' : '4px solid transparent'
                                }}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Badge dot status={isUserOnline(item._id) ? 'success' : 'default'} offset={[-2, 32]}>
                                            <Avatar src={getAvatarUrl(item.userDetails.avatar)} icon={<UserOutlined />} size="large" />
                                        </Badge>
                                    }
                                    title={<Text strong style={{ color: selectedUser?._id === item._id ? '#1677ff' : 'inherit' }}>{item.userDetails.name}</Text>}
                                    description={<Text type="secondary" ellipsis style={{ width: 180 }}>{item.lastMessage}</Text>}
                                />
                                <div style={{ fontSize: '11px', color: '#bfbfbf' }}>
                                    {dayjs(item.lastUpdate).format('HH:mm')}
                                </div>
                            </List.Item>
                        )}
                    />
                </div>
            </Sider>

            <Content style={{ display: 'flex', flexDirection: 'column', background: '#fff' }}>
                {selectedUser ? (
                    <>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
                            <Space size="middle">
                                <Badge dot status={isUserOnline(selectedUser._id) ? 'success' : 'default'} offset={[-2, 32]}>
                                    <Avatar src={getAvatarUrl(selectedUser.userDetails.avatar)} icon={<UserOutlined />} />
                                </Badge>
                                <div>
                                    <Text strong style={{ fontSize: 16, display: 'block' }}>{selectedUser.userDetails.name}</Text>
                                    <Text type={isUserOnline(selectedUser._id) ? 'success' : 'secondary'} style={{ fontSize: 12 }}>
                                        {isUserOnline(selectedUser._id) ? '● Đang trực tuyến' : '○ Ngoại tuyến'}
                                    </Text>
                                </div>
                            </Space>
                        </div>

                        <div
                            ref={scrollRef}
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '30px',
                                background: '#f0f2f5',
                                backgroundImage: 'radial-gradient(#d1d1d1 0.5px, transparent 0.5px)',
                                backgroundSize: '20px 20px'
                            }}
                        >
                            <List
                                dataSource={messages}
                                renderItem={(item) => {
                                    const isAdmin = String(item.senderId) === String(adminId);
                                    return (
                                        <div style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start', marginBottom: 20 }}>
                                            {!isAdmin && (
                                                <Avatar size="small" src={getAvatarUrl(selectedUser.userDetails.avatar)} icon={<UserOutlined />} style={{ marginRight: 8, marginTop: 4, backgroundColor: '#8c8c8c' }} />
                                            )}
                                            <div style={{ maxWidth: '75%' }}>
                                                <div style={{
                                                    padding: '12px 18px',
                                                    borderRadius: isAdmin ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                    backgroundColor: isAdmin ? '#1677ff' : '#fff',
                                                    color: isAdmin ? '#fff' : '#262626',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                    fontSize: '14px'
                                                }}>
                                                    {item.content}
                                                </div>
                                                <div style={{ fontSize: '10px', marginTop: 4, color: '#bfbfbf', textAlign: isAdmin ? 'right' : 'left' }}>
                                                    {dayjs(item.createdAt).format('HH:mm')}
                                                </div>
                                            </div>
                                            {isAdmin && (
                                                <Avatar size="small" icon={<CustomerServiceOutlined />} style={{ marginLeft: 8, marginTop: 4, backgroundColor: '#1677ff' }} />
                                            )}
                                        </div>
                                    );
                                }}
                            />
                        </div>

                        <div style={{ padding: '24px', borderTop: '1px solid #f0f0f0' }}>
                            <Flex gap="middle">
                                <Input
                                    size="large"
                                    placeholder="Nhập phản hồi cho khách hàng..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onPressEnter={handleSendMessage}
                                    style={{ borderRadius: '8px' }}
                                />
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<SendOutlined />}
                                    onClick={handleSendMessage}
                                    style={{ borderRadius: '8px' }}
                                >
                                    Gửi
                                </Button>
                            </Flex>
                        </div>
                    </>
                ) : (
                    <Flex vertical justify="center" align="center" style={{ height: '100%', color: '#bfbfbf', background: '#f9f9f9' }}>
                        <MessageOutlined style={{ fontSize: '64px', marginBottom: 16, opacity: 0.2 }} />
                        <Title level={5} type="secondary">Chọn một khách hàng để bắt đầu hỗ trợ</Title>
                        <Text type="secondary">Các yêu cầu mới sẽ tự động xuất hiện ở danh sách bên trái</Text>
                    </Flex>
                )}
            </Content>
        </Layout>
    );
}
