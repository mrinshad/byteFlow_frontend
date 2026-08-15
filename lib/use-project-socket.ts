'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let globalSocket: Socket | null = null;

function getSocket(): Socket {
  if (!globalSocket) {
    globalSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      withCredentials: true,
    });
  }
  return globalSocket;
}

export function useProjectSocket(projectId: string | undefined) {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    const socket = getSocket();

    const onConnect = () => {
      setIsConnected(true);
      socket.emit('join:project', projectId);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    if (socket.connected) {
      setIsConnected(true);
      socket.emit('join:project', projectId);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Lane events
    const onLaneChange = () => {
      queryClient.invalidateQueries({ queryKey: ['lanes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-stats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activities', 'project', projectId] });
    };

    // Card events
    const onCardChange = (payload?: any) => {
      queryClient.invalidateQueries({ queryKey: ['cards', projectId] });
      queryClient.invalidateQueries({ queryKey: ['lanes', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-stats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activities', 'project', projectId] });
      if (payload?.id) {
        queryClient.invalidateQueries({ queryKey: ['card', payload.id] });
        queryClient.invalidateQueries({ queryKey: ['activities', 'card', payload.id] });
      }
    };

    // Comment events
    const onCommentChange = (payload?: any) => {
      queryClient.invalidateQueries({ queryKey: ['cards', projectId] });
      if (payload?.cardId) {
        queryClient.invalidateQueries({ queryKey: ['comments', payload.cardId] });
        queryClient.invalidateQueries({ queryKey: ['card', payload.cardId] });
        queryClient.invalidateQueries({ queryKey: ['activities', 'card', payload.cardId] });
      }
      queryClient.invalidateQueries({ queryKey: ['activities', 'project', projectId] });
    };

    // Tag events
    const onTagChange = (payload?: any) => {
      queryClient.invalidateQueries({ queryKey: ['tags', projectId] });
      queryClient.invalidateQueries({ queryKey: ['cards', projectId] });
      if (payload?.cardId) {
        queryClient.invalidateQueries({ queryKey: ['card', payload.cardId] });
        queryClient.invalidateQueries({ queryKey: ['activities', 'card', payload.cardId] });
      }
      queryClient.invalidateQueries({ queryKey: ['activities', 'project', projectId] });
    };

    socket.on('lane:created', onLaneChange);
    socket.on('lane:updated', onLaneChange);
    socket.on('lane:reordered', onLaneChange);
    socket.on('lane:deleted', onLaneChange);

    socket.on('card:created', onCardChange);
    socket.on('card:updated', onCardChange);
    socket.on('card:moved', onCardChange);
    socket.on('card:reordered', onCardChange);
    socket.on('card:deleted', onCardChange);

    socket.on('comment:created', onCommentChange);
    socket.on('comment:updated', onCommentChange);
    socket.on('comment:deleted', onCommentChange);

    socket.on('tag:created', onTagChange);
    socket.on('tag:updated', onTagChange);
    socket.on('tag:deleted', onTagChange);
    socket.on('card:tag:added', onTagChange);
    socket.on('card:tag:removed', onTagChange);

    return () => {
      socket.emit('leave:project', projectId);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('lane:created', onLaneChange);
      socket.off('lane:updated', onLaneChange);
      socket.off('lane:reordered', onLaneChange);
      socket.off('lane:deleted', onLaneChange);
      socket.off('card:created', onCardChange);
      socket.off('card:updated', onCardChange);
      socket.off('card:moved', onCardChange);
      socket.off('card:reordered', onCardChange);
      socket.off('card:deleted', onCardChange);
      socket.off('comment:created', onCommentChange);
      socket.off('comment:updated', onCommentChange);
      socket.off('comment:deleted', onCommentChange);
      socket.off('tag:created', onTagChange);
      socket.off('tag:updated', onTagChange);
      socket.off('tag:deleted', onTagChange);
      socket.off('card:tag:added', onTagChange);
      socket.off('card:tag:removed', onTagChange);
    };
  }, [projectId, queryClient]);

  return { isConnected };
}

export function useUserNotificationsSocket(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    const onConnect = () => {
      socket.emit('join:user', userId);
    };

    if (socket.connected) {
      socket.emit('join:user', userId);
    }

    socket.on('connect', onConnect);

    const onNotificationChange = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    };

    socket.on('notification:new', onNotificationChange);
    socket.on('notification:read', onNotificationChange);
    socket.on('notification:read:all', onNotificationChange);

    return () => {
      socket.emit('leave:user', userId);
      socket.off('connect', onConnect);
      socket.off('notification:new', onNotificationChange);
      socket.off('notification:read', onNotificationChange);
      socket.off('notification:read:all', onNotificationChange);
    };
  }, [userId, queryClient]);
}

