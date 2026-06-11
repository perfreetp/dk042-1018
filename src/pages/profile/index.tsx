import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import useAppStore from '@/store/useAppStore'
import styles from './index.module.scss'

const ProfilePage: React.FC = () => {
  const {
    currentUser,
    shelf,
    favorites,
    browseHistory,
    priceAlerts,
    orders,
    chats
  } = useAppStore()

  const completedCount = orders.filter(o => o.status === 'completed' && o.buyerId === 'me').length
  const sellingCount = shelf.filter(s => s.status === 'selling').length
  const unreadCount = chats.reduce((sum, c) => sum + c.unreadCount, 0)

  const handleNav = (page: string, desc: string) => {
    switch (page) {
      case 'shelf':
        Taro.navigateTo({ url: '/pages/shelf/index' })
        break
      case 'favorites':
        Taro.navigateTo({ url: '/pages/favorites/index' })
        break
      case 'history':
        Taro.navigateTo({ url: '/pages/history/index' })
        break
      case 'alerts':
      case 'alert-list':
        Taro.navigateTo({ url: '/pages/price-alert/index' })
        break
      case 'buy':
        Taro.navigateTo({ url: '/pages/publish/index' })
        break
      default:
        Taro.showToast({ title: `${desc}功能`, icon: 'none' })
    }
  }

  const handlePublish = () => {
    Taro.navigateTo({ url: '/pages/publish/index' })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image
            className={styles.avatar}
            src={currentUser.avatar}
            mode="aspectFill"
          />
          <View className={styles.userDetail}>
            <View className={styles.userNameRow}>
              <Text className={styles.userName}>{currentUser.name}</Text>
              <View className={styles.creditBadge}>
                <Text className={styles.creditIcon}>⭐</Text>
                <Text className={styles.creditText}>{currentUser.credit}分</Text>
              </View>
            </View>
            <View className={styles.userMeta}>
              <Text className={styles.userCollege}>🎓 {currentUser.college}</Text>
              <Text>📅 {currentUser.grade}</Text>
            </View>
            <View className={styles.userMeta}>
              <Text>已完成 {currentUser.dealCount} 笔交易</Text>
            </View>
          </View>
          <Text className={styles.settingsBtn}>⚙</Text>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{sellingCount}</Text>
          <Text className={styles.statLabel}>在卖</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{completedCount}</Text>
          <Text className={styles.statLabel}>已购</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{favorites.length}</Text>
          <Text className={styles.statLabel}>收藏</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{browseHistory.length}</Text>
          <Text className={styles.statLabel}>浏览</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleText}>我的书架</Text>
            <Text className={styles.sectionMore} onClick={() => handleNav('shelf', '我的书架')}>
              管理 ›
            </Text>
          </View>
          <View className={styles.shelfPreview}>
            <View className={styles.shelfList}>
              {shelf.length > 0 ? shelf.map(item => (
                <View key={item.id} className={styles.shelfItem}>
                  <Image
                    className={styles.shelfBookImg}
                    src={item.book.images[0]?.url}
                    mode="aspectFill"
                  />
                  <View className={styles.shelfBookInfo}>
                    <Text className={styles.shelfBookTitle}>{item.book.title}</Text>
                    <Text className={`${styles.shelfStatus} ${item.status === 'selling' ? styles.selling : styles.sold}`}>
                      {item.status === 'selling' ? '在售' : '已售'}
                    </Text>
                  </View>
                </View>
              )) : (
                <View style={{ padding: '40rpx 0', textAlign: 'center', color: '#9CA3AF', fontSize: '24rpx', width: '100%' }}>
                  书架空空，去发布一本书吧~
                </View>
              )}
              <View
                className={styles.shelfItem}
                onClick={handlePublish}
                style={{
                  border: '3rpx dashed #86EFAC',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#F0FDF4',
                  minHeight: '340rpx'
                }}
              >
                <Text style={{ fontSize: '60rpx', color: '#22C55E' }}>+</Text>
                <Text style={{ fontSize: '24rpx', color: '#16A34A', marginTop: '8rpx' }}>发布新书</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleText}>常用功能</Text>
          </View>
          <View className={styles.quickGrid}>
            <View className={styles.gridItem} onClick={handlePublish}>
              <View className={`${styles.gridIcon} ${styles.gridIcon1}`}>📚</View>
              <Text className={styles.gridText}>发布卖书</Text>
            </View>
            <View className={styles.gridItem} onClick={() => handleNav('buy', '求购发布')}>
              <View className={`${styles.gridIcon} ${styles.gridIcon2}`}>🛒</View>
              <Text className={styles.gridText}>发布求购</Text>
            </View>
            <View className={styles.gridItem} onClick={() => handleNav('favorites', '收藏')}>
              <View className={`${styles.gridIcon} ${styles.gridIcon3}`}>
                <Text>❤️</Text>
                {favorites.length > 0 && (
                  <Text style={{
                    position: 'absolute',
                    top: '-4rpx',
                    right: '-4rpx',
                    minWidth: '28rpx',
                    height: '28rpx',
                    background: '#EF4444',
                    color: '#fff',
                    fontSize: '18rpx',
                    borderRadius: '14rpx',
                    padding: '0 8rpx',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>{favorites.length}</Text>
                )}
              </View>
              <Text className={styles.gridText}>我的收藏</Text>
            </View>
            <View className={styles.gridItem} onClick={() => handleNav('history', '浏览记录')}>
              <View className={`${styles.gridIcon} ${styles.gridIcon4}`}>👀</View>
              <Text className={styles.gridText}>浏览记录</Text>
            </View>
            <View className={styles.gridItem} onClick={() => handleNav('alerts', '降价提醒')}>
              <View className={`${styles.gridIcon} ${styles.gridIcon5}`}>
                <Text>🔔</Text>
                {priceAlerts.length > 0 && (
                  <Text style={{
                    position: 'absolute',
                    top: '-4rpx',
                    right: '-4rpx',
                    minWidth: '28rpx',
                    height: '28rpx',
                    background: '#EF4444',
                    color: '#fff',
                    fontSize: '18rpx',
                    borderRadius: '14rpx',
                    padding: '0 8rpx',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>{priceAlerts.length}</Text>
                )}
              </View>
              <Text className={styles.gridText}>降价提醒</Text>
            </View>
            <View className={styles.gridItem} onClick={() => Taro.switchTab({ url: '/pages/order/index' })}>
              <View className={`${styles.gridIcon} ${styles.gridIcon6}`}>📋</View>
              <Text className={styles.gridText}>交易记录</Text>
            </View>
            <View className={styles.gridItem} onClick={() => Taro.switchTab({ url: '/pages/chat/index' })}>
              <View className={`${styles.gridIcon} ${styles.gridIcon7}`}>
                <Text>💬</Text>
                {unreadCount > 0 && (
                  <Text style={{
                    position: 'absolute',
                    top: '-4rpx',
                    right: '-4rpx',
                    minWidth: '28rpx',
                    height: '28rpx',
                    background: '#EF4444',
                    color: '#fff',
                    fontSize: '18rpx',
                    borderRadius: '14rpx',
                    padding: '0 8rpx',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                )}
              </View>
              <Text className={styles.gridText}>消息中心</Text>
            </View>
            <View className={styles.gridItem} onClick={() => handleNav('help', '帮助中心')}>
              <View className={`${styles.gridIcon} ${styles.gridIcon8}`}>❓</View>
              <Text className={styles.gridText}>帮助中心</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleText}>最近浏览</Text>
            <Text className={styles.sectionMore} onClick={() => handleNav('history', '浏览历史')}>
              全部 ›
            </Text>
          </View>
          <View className={styles.historyList}>
            {browseHistory.slice(0, 3).map(h => (
              <View key={h.id} className={styles.historyItem}>
                <Image
                  className={styles.historyImg}
                  src={h.book.images[0]?.url}
                  mode="aspectFill"
                />
                <View className={styles.historyInfo}>
                  <Text className={styles.historyTitle}>{h.book.title}</Text>
                  <View className={styles.historyMeta}>
                    <Text className={styles.historyPrice}>
                      {h.book.type === 'exchange' ? '换书' : h.book.price === 0 ? '面议' : `¥${h.book.price}`}
                    </Text>
                    <Text className={styles.historyTime}>{h.viewedAt.slice(5, 16)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.listItem} onClick={() => handleNav('alert-list', '降价提醒')}>
            <View className={styles.listIcon}>🔔</View>
            <View className={styles.listContent}>
              <Text className={styles.listTitle}>降价提醒</Text>
              <Text className={styles.listDesc}>有 {priceAlerts.length} 本书设置了降价提醒</Text>
            </View>
            {priceAlerts.length > 0 && <View className={styles.badge}>{priceAlerts.length}</View>}
            <Text className={styles.listArrow}>›</Text>
          </View>

          <View className={styles.listItem} onClick={() => handleNav('address', '取书地点')}>
            <View className={styles.listIcon}>📍</View>
            <View className={styles.listContent}>
              <Text className={styles.listTitle}>常用取书地点</Text>
              <Text className={styles.listDesc}>设置方便的校内取书点</Text>
            </View>
            <Text className={styles.listArrow}>›</Text>
          </View>

          <View className={styles.listItem} onClick={() => handleNav('feedback', '意见反馈')}>
            <View className={styles.listIcon}>💡</View>
            <View className={styles.listContent}>
              <Text className={styles.listTitle}>意见反馈</Text>
              <Text className={styles.listDesc}>告诉我们你想改进的地方</Text>
            </View>
            <Text className={styles.listArrow}>›</Text>
          </View>

          <View className={styles.listItem} onClick={() => handleNav('about', '关于我们')}>
            <View className={styles.listIcon}>📖</View>
            <View className={styles.listContent}>
              <Text className={styles.listTitle}>关于校园书易</Text>
              <Text className={styles.listDesc}>让闲置教材流动起来 v1.0.0</Text>
            </View>
            <Text className={styles.listArrow}>›</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ProfilePage
