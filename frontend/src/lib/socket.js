import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}

export function connectSocket() {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect()
  }
}

export function joinPollRoom(pollId) {
  const s = getSocket()
  if (s.connected) {
    s.emit('poll:join', pollId)
  }
}

export function leavePollRoom(pollId) {
  const s = getSocket()
  if (s.connected) {
    s.emit('poll:leave', pollId)
  }
}
