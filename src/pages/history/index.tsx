import React from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Book } from '@/types'
import Empty from '@/components/Empty'
import useAppStore from '@/store/useAppStore'
import styles from './index.module.scss'

const formatViewedAt = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`

  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

const HistoryPage: React.FC = () => {
  const { browseHistory, clearBrowseHistory, setCurrentBook, addBrowseHistory } = useAppStore()

  const sortedHistory = [...browseHistory].sort((a, b) =>
    new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
  )

  const handleClearAll = () => {
    if (browseHistory.length === 0) {
      Taro.showToast({ title: '暂无浏览记录', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '清空浏览记录',
      content: '确定要清空全部浏览记录吗？此操作不可恢复。',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          clearBrowseHistory()
          Taro.showToast({ title: '清空成功', icon: 'success' })
        }
      }
    })
  }

  const handleCardClick = (book: Book) => {
    setCurrentBook(book)
    addBrowseHistory(book)
    Taro.navigateTo({ url: '/pages/detail/index' })
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    Taro.showToast({ title: '可点击右上角清空全部', icon: 'none' })
  }

  const renderPrice = (book: Book) => {
    if (book.type === 'exchange') {
      return <Text className={styles.free}>换书</Text>
    }
    if (book.price === 0) {
      return <Text className={styles.free}>面议</Text>
    }
    return <Text className={styles.price}>¥{book.price}</Text>
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>浏览记录</Text>
        <View className={styles.clearBtn} onClick={handleClearAll}>
          <Text className={styles.clearBtnIcon}>🗑️</Text>
          <Text className={styles.clearBtnText}>清空</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.listContainer}>
        {sortedHistory.length > 0 ? (
          <>
            <View className={styles.statsBar}>
              <View className={styles.statsInfo}>
                <Text className={styles.statsIcon}>👣</Text>
                <View className={styles.statsText}>
                  <Text className={styles.statsLabel}>累计浏览</Text>
                  <Text className={styles.statsCount}>
                    <Text className={styles.countNum}>{sortedHistory.length}</Text>本书籍
                  </Text>
                </View>
              </View>
              <Text className={styles.statsHint}>最近更新</Text>
            </View>

            <View className={styles.bookList}>
              {sortedHistory.map((item) => {
                const book = item.book
                return (
                  <View
                    key={item.id}
                    className={styles.card}
                    onClick={() => handleCardClick(book)}
                  >
                    <View className={styles.imageWrap}>
                      <Image
                        className={styles.bookImage}
                        src={book.images[0]?.url || 'https://picsum.photos/id/119/300/400'}
                        mode='aspectFill'
                      />
                    </View>
                    <View className={styles.content}>
                      <View className={styles.mainContent}>
                        <Text className={styles.title}>{book.title}</Text>
                        <View className={styles.meta}>
                          <Text className={styles.metaRow}>
                            {book.author} · {book.college}
                          </Text>
                          <Text className={styles.metaRow}>
                            {book.course} · {book.publisher}
                          </Text>
                        </View>
                        <View className={styles.priceWrap}>
                          {renderPrice(book)}
                        </View>
                      </View>
                    </View>
                    <View className={styles.sideContent}>
                      <Text className={styles.viewedAt}>
                        {formatViewedAt(item.viewedAt)}
                      </Text>
                      <View
                        className={styles.deleteBtn}
                        onClick={handleDeleteClick}
                      >
                        <Text className={styles.deleteIcon}>✕</Text>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          </>
        ) : (
          <Empty
            icon='👣'
            title='暂无浏览记录'
            desc='多看看教材，记录会自动出现在这里'
          />
        )}
      </ScrollView>
    </View>
  )
}

export default HistoryPage
