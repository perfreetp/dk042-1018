import React from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Book, CONDITION_LABEL } from '@/types'
import Tag from '@/components/Tag'
import Empty from '@/components/Empty'
import useAppStore from '@/store/useAppStore'
import styles from './index.module.scss'

const FavoritesPage: React.FC = () => {
  const { favorites, removeFavorite, setCurrentBook, addBrowseHistory } = useAppStore()

  const handleDelete = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation()
    Taro.showModal({
      title: '删除收藏',
      content: `确定要删除《${book.title}》吗？`,
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          removeFavorite(book.id)
          Taro.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  }

  const handleCardClick = (book: Book) => {
    setCurrentBook(book)
    addBrowseHistory(book)
    Taro.navigateTo({ url: '/pages/detail/index' })
  }

  const getTypeTag = (type: Book['type']) => {
    switch (type) {
      case 'sell': return { text: '出售', type: 'primary' as const }
      case 'buy': return { text: '求购', type: 'orange' as const }
      case 'exchange': return { text: '换书', type: 'blue' as const }
    }
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.listContainer}>
        {favorites.length > 0 ? (
          <>
            <View className={styles.listHeader}>
              <Text className={styles.listTitle}>我的收藏</Text>
              <Text className={styles.listCount}>
                共 <Text className={styles.countNum}>{favorites.length}</Text> 本
              </Text>
            </View>
            <View className={styles.bookList}>
              {favorites.map((item) => {
                const book = item.book
                const typeTag = getTypeTag(book.type)
                return (
                  <View
                    key={item.id}
                    className={styles.card}
                    onClick={() => handleCardClick(book)}
                  >
                    <View
                      className={styles.deleteBtn}
                      onClick={(e) => handleDelete(book, e)}
                    >
                      <Text className={styles.deleteIcon}>✕</Text>
                    </View>
                    <View className={styles.imageWrap}>
                      <Image
                        className={styles.bookImage}
                        src={book.images[0]?.url || 'https://picsum.photos/id/119/300/400'}
                        mode='aspectFill'
                      />
                    </View>
                    <View className={styles.content}>
                      <View className={styles.header}>
                        <View className={styles.titleRow}>
                          <Text className={styles.title}>{book.title}</Text>
                          <View className={styles.typeTag}>
                            <Tag text={typeTag.text} type={typeTag.type} size='normal' />
                          </View>
                        </View>
                        <View className={styles.meta}>
                          <Text className={styles.metaRow}>{book.author} · {book.publisher}</Text>
                          <Text className={styles.metaRow}>{book.edition} | {book.college} · {book.course}</Text>
                        </View>
                        <View className={styles.tags}>
                          <Tag text={CONDITION_LABEL[book.condition]} type='gray' />
                          {book.hasNotes && <Tag text='有笔记' type='gold' />}
                          {book.negotiable && <Tag text='可议价' type='primary' />}
                        </View>
                      </View>
                      <View className={styles.footer}>
                        <View className={styles.priceWrap}>
                          {book.type === 'exchange' ? (
                            <Text className={styles.free}>换书</Text>
                          ) : book.price === 0 ? (
                            <Text className={styles.free}>面议</Text>
                          ) : (
                            <>
                              <Text className={styles.price}>¥{book.price}</Text>
                              {book.originalPrice > 0 && (
                                <Text className={styles.originalPrice}>¥{book.originalPrice}</Text>
                              )}
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          </>
        ) : (
          <Empty
            icon='💔'
            title='暂无收藏'
            desc='看到喜欢的教材点❤️收藏起来吧'
          />
        )}
      </ScrollView>
    </View>
  )
}

export default FavoritesPage
