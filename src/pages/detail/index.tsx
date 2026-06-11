import React, { useState } from 'react'
import { View, Text, Image, Swiper, SwiperItem, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import Tag from '@/components/Tag'
import Empty from '@/components/Empty'
import useAppStore from '@/store/useAppStore'
import { CONDITION_LABEL } from '@/types'
import classnames from 'classnames'
import styles from './index.module.scss'

const DetailPage: React.FC = () => {
  const { currentBook, toggleFavorite, isFavorite, currentUser } = useAppStore()
  const [activeImg, setActiveImg] = useState(0)

  useDidShow(() => {
    if (!currentBook) {
      Taro.showToast({ title: '数据加载失败', icon: 'none' })
    }
  })

  if (!currentBook) {
    return (
      <View className={styles.page}>
        <Empty icon="📖" title="教材不存在" desc="该教材可能已下架或删除" />
      </View>
    )
  }

  const book = currentBook
  const favorited = isFavorite(book.id)

  const handleFav = () => {
    toggleFavorite(book.id)
    Taro.showToast({ title: favorited ? '已取消收藏' : '收藏成功', icon: 'none' })
  }

  const handleContact = () => {
    Taro.switchTab({ url: '/pages/chat/index' })
  }

  const handleReserve = () => {
    const isOwn = book.seller.id === currentUser.id
    if (isOwn) {
      Taro.showToast({ title: '这是你发布的书哦', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '确认预留',
      content: `确定要以 ¥${book.price} 的价格预留《${book.title}》吗？`,
      confirmText: '确认预留',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '预留成功，请等待卖家确认', icon: 'success' })
          setTimeout(() => Taro.switchTab({ url: '/pages/order/index' }), 1500)
        }
      }
    })
  }

  const handleChat = () => {
    Taro.switchTab({ url: '/pages/chat/index' })
  }

  const getTypeInfo = () => {
    switch (book.type) {
      case 'sell': return { text: '出售', type: 'primary' as const, btn: '我要购买', secBtn: '联系卖家' }
      case 'buy': return { text: '求购', type: 'orange' as const, btn: '我有这本书', secBtn: '联系求购者' }
      case 'exchange': return { text: '换书', type: 'blue' as const, btn: '我想换书', secBtn: '联系TA' }
    }
  }
  const typeInfo = getTypeInfo()

  return (
    <View className={styles.page}>
      <View className={styles.swiperWrap}>
        <View className={classnames(styles.favBtn, favorited && styles.favorited)} onClick={handleFav}>
          {favorited ? '❤️' : '🤍'}
        </View>
        {book.images.length > 1 ? (
          <>
            <Swiper
              className={styles.swiperWrap}
              indicatorDots={false}
              autoplay={book.images.length > 3}
              interval={4000}
              onChange={(e) => setActiveImg(e.detail.current)}
            >
              {book.images.map((img, idx) => (
                <SwiperItem key={img.id}>
                  <Image
                    className={styles.swiperImg}
                    src={img.url}
                    mode="aspectFill"
                  />
                </SwiperItem>
              ))}
            </Swiper>
            <View className={styles.indicator}>
              {activeImg + 1} / {book.images.length}
            </View>
          </>
        ) : (
          <Image
            className={styles.swiperImg}
            src={book.images[0]?.url}
            mode="aspectFill"
          />
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.bookHeader}>
          <View className={styles.titleRow}>
            <Text className={styles.bookTitle}>{book.title}</Text>
            <View className={styles.typeTag}>
              <Tag text={typeInfo.text} type={typeInfo.type} size="large" />
            </View>
          </View>
          <View className={styles.authorRow}>
            <Text className={styles.authorText}>📝 {book.author}</Text>
            <Text>🏢 {book.publisher}</Text>
          </View>
          <View className={styles.priceRow}>
            {book.type === 'exchange' ? (
              <Text className={styles.price} style={{ color: '#3B82F6' }}>换书</Text>
            ) : book.price === 0 ? (
              <Text className={styles.price} style={{ color: '#16A34A' }}>面议</Text>
            ) : (
              <>
                <Text className={styles.price}>¥{book.price}</Text>
                {book.originalPrice > 0 && (
                  <Text className={styles.originalPrice}>原价 ¥{book.originalPrice}</Text>
                )}
                {book.priceRange && (
                  <Text className={styles.priceRange}>
                    市场价 ¥{book.priceRange[0]}-{book.priceRange[1]}
                  </Text>
                )}
              </>
            )}
          </View>
          <View className={styles.tagRow}>
            <Tag text={CONDITION_LABEL[book.condition]} type="gray" />
            <Tag text={book.college} type="primary" />
            <Tag text={book.course} type="blue" />
            <Tag text={book.edition} type="gray" />
            {book.hasNotes && <Tag text="含笔记" type="gold" />}
            {book.negotiable && <Tag text="可议价" type="orange" />}
          </View>
          <View className={styles.statsRow}>
            <View className={styles.statItem}>
              <Text>👁</Text>
              <Text>{book.viewCount} 浏览</Text>
            </View>
            <View className={styles.statItem}>
              <Text>❤️</Text>
              <Text>{book.favoriteCount} 收藏</Text>
            </View>
            <View className={styles.statItem}>
              <Text>🕐</Text>
              <Text>发布于 {book.createdAt}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.sectionTitleIcon} />
          <Text className={styles.sectionTitleText}>基本信息</Text>
        </View>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>ISBN编号</Text>
            <Text className={styles.infoValue}>{book.isbn}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>版次</Text>
            <Text className={styles.infoValue}>{book.edition}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>所属学院</Text>
            <Text className={styles.infoValue}>{book.college}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>课程名称</Text>
            <Text className={styles.infoValue}>{book.course}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>新旧程度</Text>
            <Text className={styles.infoValue}>{CONDITION_LABEL[book.condition]}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>是否有笔记</Text>
            <Text className={styles.infoValue}>{book.hasNotes ? '有笔记' : '无笔记'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.sectionTitleIcon} />
          <Text className={styles.sectionTitleText}>详细描述</Text>
        </View>
        <Text className={styles.descText}>{book.description}</Text>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.sectionTitleIcon} />
          <Text className={styles.sectionTitleText}>校内取书地点</Text>
        </View>
        <View className={styles.locationList}>
          {book.pickupLocations.map((loc, idx) => (
            <View key={idx} className={styles.locationItem}>
              <Text className={styles.locationIcon}>📍</Text>
              <Text>{loc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.sectionTitleIcon} />
          <Text className={styles.sectionTitleText}>卖家信息</Text>
        </View>
        <View className={styles.sellerCard}>
          <Image
            className={styles.sellerAvatar}
            src={book.seller.avatar}
            mode="aspectFill"
          />
          <View className={styles.sellerInfo}>
            <View className={styles.sellerNameRow}>
              <Text className={styles.sellerName}>{book.seller.name}</Text>
              <View className={styles.creditBadge}>
                <Text>⭐</Text>
                <Text>信用 {book.seller.credit}</Text>
              </View>
            </View>
            <Text className={styles.sellerMeta}>
              🎓 {book.seller.college} · {book.seller.grade} | 已完成 {book.seller.dealCount} 笔交易
            </Text>
          </View>
          <Button className={styles.chatBtn} onClick={handleChat}>
            💬 聊天
          </Button>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={classnames(styles.actionBtn, styles.secondaryBtn)} onClick={handleContact}>
          💬 联系{typeInfo.secBtn.slice(2)}
        </Button>
        <Button className={classnames(styles.actionBtn, styles.primaryBtn)} onClick={handleReserve}>
          {typeInfo.btn}
        </Button>
      </View>
    </View>
  )
}

export default DetailPage
