import React, { useState, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import Empty from '@/components/Empty'
import Tag from '@/components/Tag'
import useAppStore from '@/store/useAppStore'
import { ShelfItem, Book } from '@/types'
import styles from './index.module.scss'

type TabKey = 'all' | 'selling' | 'sold' | 'offline'

const TAB_LIST: { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'selling', label: '出售中' },
  { key: 'sold', label: '已售' },
  { key: 'offline', label: '已下架' }
]

const STATUS_CONFIG: Record<ShelfItem['status'], { tagText: string; tagType: 'primary' | 'gold' | 'gray' }> = {
  selling: { tagText: '出售中', tagType: 'primary' },
  sold: { tagText: '已售', tagType: 'gold' },
  offline: { tagText: '已下架', tagType: 'gray' }
}

const ShelfPage: React.FC = () => {
  const { shelf, removeShelfItem, setCurrentBook, addBrowseHistory } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  const filteredShelf = useMemo(() => {
    if (activeTab === 'all') return shelf
    return shelf.filter(item => item.status === activeTab)
  }, [shelf, activeTab])

  const handleCardClick = (item: ShelfItem) => {
    setCurrentBook(item.book)
    addBrowseHistory(item.book)
    Taro.navigateTo({ url: '/pages/detail/index' })
  }

  const handleEdit = (book: Book) => {
    Taro.showToast({ title: '去编辑：' + book.title, icon: 'none' })
  }

  const handleMarkSold = (item: ShelfItem) => {
    Taro.showModal({
      title: '确认标记',
      content: `确定要将《${item.book.title}》标记为已售吗？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已标记为已售', icon: 'success' })
        }
      }
    })
  }

  const handleRelist = (book: Book) => {
    Taro.showToast({ title: '重新上架：' + book.title, icon: 'none' })
  }

  const handleDelete = (item: ShelfItem) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要从书架删除《${item.book.title}》吗？`,
      success: (res) => {
        if (res.confirm) {
          removeShelfItem(item.id)
          Taro.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  }

  const handleGoPublish = () => {
    Taro.navigateTo({ url: '/pages/publish/index' })
  }

  return (
    <View className={styles.page}>
      <View className={styles.tabBar}>
        {TAB_LIST.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.tabActive)}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={classnames(styles.tabText, activeTab === tab.key && styles.tabTextActive)}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View className={styles.tabIndicator} />}
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.scrollContent}>
        {filteredShelf.length > 0 ? (
          <View className={styles.bookList}>
            {filteredShelf.map(item => {
              const statusCfg = STATUS_CONFIG[item.status]
              return (
                <View key={item.id} className={styles.bookCard}>
                  <View className={styles.cardMain} onClick={() => handleCardClick(item)}>
                    <Image
                      className={styles.bookImage}
                      src={item.book.images[0]?.url}
                      mode='aspectFill'
                    />
                    <View className={styles.bookInfo}>
                      <View className={styles.titleRow}>
                        <Text className={styles.bookTitle}>{item.book.title}</Text>
                        <Tag text={statusCfg.tagText} type={statusCfg.tagType} size='normal' />
                      </View>
                      <Text className={styles.addedTime}>上架时间：{item.addedAt}</Text>
                      <View className={styles.priceRow}>
                        <Text className={styles.priceSymbol}>¥</Text>
                        <Text className={styles.priceValue}>{item.book.price}</Text>
                        <Text className={styles.originalPrice}>¥{item.book.originalPrice}</Text>
                      </View>
                    </View>
                  </View>

                  <View className={styles.actionBar}>
                    {item.status === 'selling' ? (
                      <>
                        <View
                          className={classnames(styles.actionBtn, styles.btnSecondary)}
                          onClick={() => handleEdit(item.book)}
                        >
                          <Text className={styles.btnSecondaryText}>去编辑</Text>
                        </View>
                        <View
                          className={classnames(styles.actionBtn, styles.btnPrimary)}
                          onClick={() => handleMarkSold(item)}
                        >
                          <Text className={styles.btnPrimaryText}>标记已售</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View
                          className={classnames(styles.actionBtn, styles.btnSecondary)}
                          onClick={() => handleRelist(item.book)}
                        >
                          <Text className={styles.btnSecondaryText}>重新上架</Text>
                        </View>
                        <View
                          className={classnames(styles.actionBtn, styles.btnDanger)}
                          onClick={() => handleDelete(item)}
                        >
                          <Text className={styles.btnDangerText}>删除</Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        ) : (
          <Empty
            icon='📚'
            title='书架空空如也'
            desc='去发布页上架你的闲置教材吧'
            actionText='去发布'
            onAction={handleGoPublish}
          />
        )}
      </ScrollView>
    </View>
  )
}

export default ShelfPage
