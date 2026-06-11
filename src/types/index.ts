export interface User {
  id: string
  name: string
  avatar: string
  college: string
  grade: string
  credit: number
  dealCount: number
}

export interface BookImage {
  id: string
  url: string
}

export type BookCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor'
export type BookType = 'sell' | 'buy' | 'exchange'

export interface Book {
  id: string
  title: string
  author: string
  publisher: string
  isbn: string
  edition: string
  college: string
  course: string
  price: number
  originalPrice: number
  condition: BookCondition
  type: BookType
  hasNotes: boolean
  negotiable: boolean
  description: string
  images: BookImage[]
  seller: User
  pickupLocations: string[]
  priceRange?: [number, number]
  createdAt: string
  viewCount: number
  favoriteCount: number
}

export type OrderStatus = 'pending' | 'reserved' | 'delivering' | 'completed' | 'cancelled' | 'reported'

export interface Order {
  id: string
  bookId: string
  bookTitle: string
  bookImage: string
  price: number
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  status: OrderStatus
  type: BookType
  reservedAt?: string
  completedAt?: string
  pickupLocation?: string
  appointmentTime?: string
  rating?: number
  comment?: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'location' | 'time' | 'price'
  timestamp: string
  isRead: boolean
  location?: {
    lat: number
    lng: number
    address: string
  }
  appointmentTime?: string
  price?: number
}

export interface ChatSession {
  id: string
  userId: string
  userName: string
  userAvatar: string
  bookId: string
  bookTitle: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: ChatMessage[]
}

export interface FilterOptions {
  college?: string
  course?: string
  edition?: string
  condition?: BookCondition
  type?: BookType
  keyword?: string
}

export interface FavoriteItem {
  id: string
  book: Book
  createdAt: string
}

export interface BrowseHistory {
  id: string
  bookId: string
  book: Book
  viewedAt: string
}

export interface PriceAlert {
  id: string
  bookTitle: string
  isbn: string
  targetPrice: number
  createdAt: string
}

export interface ShelfItem {
  id: string
  book: Book
  addedAt: string
  status: 'selling' | 'sold' | 'offline'
}

export const COLLEGES = [
  '计算机学院',
  '经济管理学院',
  '外国语学院',
  '数学学院',
  '物理学院',
  '化学学院',
  '文学院',
  '法学院',
  '医学院',
  '艺术设计学院'
]

export const COURSES = [
  '数据结构',
  '高等数学',
  '微观经济学',
  '大学英语',
  '大学物理',
  '有机化学',
  '中国古代文学',
  '宪法学',
  '线性代数',
  '内科学',
  '设计心理学',
  '算法设计与分析'
]

export const EDITIONS = [
  '第2版',
  '第3版',
  '第4版',
  '第6版',
  '第7版',
  '第8版',
  '第9版',
  '修订版',
  '原书第3版'
]

export const CONDITIONS: { label: string; value: BookCondition }[] = [
  { label: '全新', value: 'new' },
  { label: '几乎全新', value: 'like-new' },
  { label: '良好', value: 'good' },
  { label: '一般', value: 'fair' },
  { label: '破旧', value: 'poor' }
]

export const CONDITION_LABEL: Record<BookCondition, string> = {
  'new': '全新',
  'like-new': '几乎全新',
  'good': '良好',
  'fair': '一般',
  'poor': '破旧'
}

export const BOOK_TYPES: { label: string; value: BookType }[] = [
  { label: '出售', value: 'sell' },
  { label: '求购', value: 'buy' },
  { label: '换书', value: 'exchange' }
]

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  'pending': '待确认',
  'reserved': '已预留',
  'delivering': '待交付',
  'completed': '已完成',
  'cancelled': '已取消',
  'reported': '举报中'
}
