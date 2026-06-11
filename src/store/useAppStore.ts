import { create } from 'zustand'
import { Book, Order, ChatSession, User, FilterOptions, FavoriteItem, BrowseHistory, PriceAlert, ShelfItem } from '@/types'
import { mockBooks } from '@/data/books'
import { mockOrders } from '@/data/orders'
import { mockChats } from '@/data/chats'

interface AppState {
  currentUser: User
  books: Book[]
  orders: Order[]
  chats: ChatSession[]
  favorites: FavoriteItem[]
  browseHistory: BrowseHistory[]
  priceAlerts: PriceAlert[]
  shelf: ShelfItem[]
  filterOptions: FilterOptions
  currentBook: Book | null
  activeChat: ChatSession | null
  
  setFilterOptions: (options: Partial<FilterOptions>) => void
  setCurrentBook: (book: Book | null) => void
  toggleFavorite: (bookId: string) => void
  isFavorite: (bookId: string) => boolean
  addBrowseHistory: (book: Book) => void
  setActiveChat: (chat: ChatSession | null) => void
  updateOrderStatus: (orderId: string, status: Order['status']) => void
  rateOrder: (orderId: string, rating: number, comment: string) => void
  reportOrder: (orderId: string) => void
  addBook: (book: Book) => void
  searchBooks: (keyword: string) => Book[]
}

const currentUser: User = {
  id: 'me',
  name: '陈同学',
  avatar: 'https://picsum.photos/id/338/200/200',
  college: '计算机学院',
  grade: '大三',
  credit: 90,
  dealCount: 12
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser,
  books: mockBooks,
  orders: mockOrders,
  chats: mockChats,
  favorites: [
    { id: 'f1', book: mockBooks[11], createdAt: '2026-06-10 12:00' },
    { id: 'f2', book: mockBooks[5], createdAt: '2026-06-09 15:30' }
  ],
  browseHistory: [
    { id: 'h1', bookId: mockBooks[0].id, book: mockBooks[0], viewedAt: '2026-06-11 18:00' },
    { id: 'h2', bookId: mockBooks[5].id, book: mockBooks[5], viewedAt: '2026-06-11 16:30' },
    { id: 'h3', bookId: mockBooks[11].id, book: mockBooks[11], viewedAt: '2026-06-11 14:20' },
    { id: 'h4', bookId: mockBooks[9].id, book: mockBooks[9], viewedAt: '2026-06-10 20:15' }
  ],
  priceAlerts: [
    { id: 'a1', bookTitle: '深入理解计算机系统', isbn: '9787111544937', targetPrice: 50, createdAt: '2026-06-08' },
    { id: 'a2', bookTitle: '操作系统概念', isbn: '9787111304267', targetPrice: 35, createdAt: '2026-06-05' }
  ],
  shelf: [
    { id: 's1', book: mockBooks[2], addedAt: '2026-06-03', status: 'selling' },
    { id: 's2', book: mockBooks[9], addedAt: '2026-06-01', status: 'sold' }
  ],
  filterOptions: {},
  currentBook: null,
  activeChat: null,

  setFilterOptions: (options) => set((state) => ({
    filterOptions: { ...state.filterOptions, ...options }
  })),

  setCurrentBook: (book) => set({ currentBook: book }),

  toggleFavorite: (bookId) => set((state) => {
    const exists = state.favorites.find(f => f.book.id === bookId)
    if (exists) {
      return { favorites: state.favorites.filter(f => f.book.id !== bookId) }
    } else {
      const book = state.books.find(b => b.id === bookId)
      if (book) {
        return {
          favorites: [...state.favorites, { id: 'f' + Date.now(), book, createdAt: new Date().toISOString() }]
        }
      }
    }
    return state
  }),

  isFavorite: (bookId) => {
    return get().favorites.some(f => f.book.id === bookId)
  },

  addBrowseHistory: (book) => set((state) => {
    const exists = state.browseHistory.find(h => h.bookId === book.id)
    if (exists) {
      return {
        browseHistory: [
          { ...exists, viewedAt: new Date().toISOString() },
          ...state.browseHistory.filter(h => h.bookId !== book.id)
        ]
      }
    }
    return {
      browseHistory: [
        { id: 'h' + Date.now(), bookId: book.id, book, viewedAt: new Date().toISOString() },
        ...state.browseHistory
      ].slice(0, 50)
    }
  }),

  setActiveChat: (chat) => set({ activeChat: chat }),

  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
  })),

  rateOrder: (orderId, rating, comment) => set((state) => ({
    orders: state.orders.map(o => o.id === orderId ? { ...o, rating, comment, status: 'completed' } : o)
  })),

  reportOrder: (orderId) => set((state) => ({
    orders: state.orders.map(o => o.id === orderId ? { ...o, status: 'reported' } : o)
  })),

  addBook: (book) => set((state) => ({
    books: [book, ...state.books]
  })),

  searchBooks: (keyword) => {
    const kw = keyword.toLowerCase().trim()
    if (!kw) return get().books
    return get().books.filter(b =>
      b.title.toLowerCase().includes(kw) ||
      b.author.toLowerCase().includes(kw) ||
      b.course.toLowerCase().includes(kw) ||
      b.college.toLowerCase().includes(kw) ||
      b.isbn.includes(kw)
    )
  }
}))

export default useAppStore
