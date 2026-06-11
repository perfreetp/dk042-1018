import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Book, CONDITION_LABEL } from '@/types'
import Tag from '@/components/Tag'
import useAppStore from '@/store/useAppStore'
import styles from './index.module.scss'

interface BookCardProps {
  book: Book
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { setCurrentBook, addBrowseHistory } = useAppStore()

  const handleClick = () => {
    setCurrentBook(book)
    addBrowseHistory(book)
    Taro.navigateTo({ url: '/pages/detail/index' })
  }

  const getTypeTag = () => {
    switch (book.type) {
      case 'sell': return { text: '出售', type: 'primary' as const }
      case 'buy': return { text: '求购', type: 'orange' as const }
      case 'exchange': return { text: '换书', type: 'blue' as const }
    }
  }

  const typeTag = getTypeTag()

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.imageWrap}>
        <Image
          className={styles.bookImage}
          src={book.images[0]?.url || 'https://picsum.photos/id/119/300/400'}
          mode="aspectFill"
        />
      </View>
      <View className={styles.content}>
        <View className={styles.header}>
          <View className={styles.titleRow}>
            <Text className={styles.title}>{book.title}</Text>
            <View className={styles.typeTag}>
              <Tag text={typeTag.text} type={typeTag.type} size="normal" />
            </View>
          </View>
          <View className={styles.meta}>
            <Text className={styles.metaRow}>{book.author} · {book.publisher}</Text>
            <Text className={styles.metaRow}>{book.edition} | {book.college} · {book.course}</Text>
          </View>
          <View className={styles.tags}>
            <Tag text={CONDITION_LABEL[book.condition]} type="gray" />
            {book.hasNotes && <Tag text="有笔记" type="gold" />}
            {book.negotiable && <Tag text="可议价" type="primary" />}
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
          <View className={styles.stats}>
            <Text>{book.viewCount}浏览</Text>
            <Text>{book.favoriteCount}收藏</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default BookCard
