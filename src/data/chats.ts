import { ChatSession } from '@/types'

export const mockChats: ChatSession[] = [
  {
    id: 'c001',
    userId: 'u001',
    userName: '张小林',
    userAvatar: 'https://picsum.photos/id/64/200/200',
    bookId: 'b001',
    bookTitle: '数据结构（C语言版）',
    lastMessage: '好的，那明天下午4点图书馆门口见~',
    lastMessageTime: '2026-06-11 18:45',
    unreadCount: 2,
    messages: [
      {
        id: 'm001',
        senderId: 'me',
        content: '你好，请问数据结构这本书还在吗？',
        type: 'text',
        timestamp: '2026-06-10 10:20',
        isRead: true
      },
      {
        id: 'm002',
        senderId: 'u001',
        content: '在的，我就在学校，可以约个时间看一下~',
        type: 'text',
        timestamp: '2026-06-10 10:25',
        isRead: true
      },
      {
        id: 'm003',
        senderId: 'me',
        content: '25块可以再便宜一点吗？',
        type: 'text',
        timestamp: '2026-06-10 14:30',
        isRead: true
      },
      {
        id: 'm004',
        senderId: 'u001',
        content: '诚心要的话22给你吧，书真的挺新的',
        type: 'price',
        price: 22,
        timestamp: '2026-06-10 15:10',
        isRead: true
      },
      {
        id: 'm005',
        senderId: 'me',
        content: '好的，那我们什么时候在哪见面？',
        type: 'text',
        timestamp: '2026-06-11 16:30',
        isRead: true
      },
      {
        id: 'm006',
        senderId: 'u001',
        content: '明天下午4点可以吗？',
        type: 'time',
        appointmentTime: '2026-06-12 16:00',
        timestamp: '2026-06-11 18:40',
        isRead: true
      },
      {
        id: 'm007',
        senderId: 'u001',
        content: '好的，那明天下午4点图书馆门口见~',
        type: 'location',
        location: {
          lat: 39.9087,
          lng: 116.3975,
          address: 'XX大学图书馆门口'
        },
        timestamp: '2026-06-11 18:45',
        isRead: false
      }
    ]
  },
  {
    id: 'c002',
    userId: 'u002',
    userName: '李思雨',
    userAvatar: 'https://picsum.photos/id/91/200/200',
    bookId: 'b003',
    bookTitle: '微观经济学',
    lastMessage: '[图片]',
    lastMessageTime: '2026-06-10 20:15',
    unreadCount: 0,
    messages: [
      {
        id: 'm101',
        senderId: 'u002',
        content: '你好，我想看下微观经济学的笔记可以吗？',
        type: 'text',
        timestamp: '2026-06-09 14:00',
        isRead: true
      },
      {
        id: 'm102',
        senderId: 'me',
        content: '当然可以，我拍几张重点给你看~',
        type: 'text',
        timestamp: '2026-06-09 14:10',
        isRead: true
      },
      {
        id: 'm103',
        senderId: 'me',
        content: 'https://picsum.photos/id/292/600/400',
        type: 'image',
        timestamp: '2026-06-10 20:15',
        isRead: true
      }
    ]
  },
  {
    id: 'c003',
    userId: 'u003',
    userName: '王明远',
    userAvatar: 'https://picsum.photos/id/177/200/200',
    bookId: 'b006',
    bookTitle: '有机化学',
    lastMessage: '邢大本是上下册的对吧？我明天来取。',
    lastMessageTime: '2026-06-11 09:30',
    unreadCount: 1,
    messages: [
      {
        id: 'm201',
        senderId: 'me',
        content: '请问有机化学还在吗？',
        type: 'text',
        timestamp: '2026-06-11 08:00',
        isRead: true
      },
      {
        id: 'm202',
        senderId: 'u003',
        content: '还在的，上下册都很新',
        type: 'text',
        timestamp: '2026-06-11 09:00',
        isRead: true
      },
      {
        id: 'm203',
        senderId: 'u003',
        content: '邢大本是上下册的对吧？我明天来取。',
        type: 'text',
        timestamp: '2026-06-11 09:30',
        isRead: false
      }
    ]
  },
  {
    id: 'c004',
    userId: 'u002',
    userName: '李思雨',
    userAvatar: 'https://picsum.photos/id/91/200/200',
    bookId: 'b002',
    bookTitle: '高等数学（上册）',
    lastMessage: '谢谢！高数考完啦考得不错！',
    lastMessageTime: '2026-06-08 15:20',
    unreadCount: 0,
    messages: [
      {
        id: 'm301',
        senderId: 'me',
        content: '书收到了，谢谢你啦~',
        type: 'text',
        timestamp: '2026-06-06 15:30',
        isRead: true
      },
      {
        id: 'm302',
        senderId: 'u002',
        content: '不客气！有问题随时问~',
        type: 'text',
        timestamp: '2026-06-06 16:00',
        isRead: true
      },
      {
        id: 'm303',
        senderId: 'u002',
        content: '谢谢！高数考完啦考得不错！',
        type: 'text',
        timestamp: '2026-06-08 15:20',
        isRead: true
      }
    ]
  }
]

export default mockChats
