import React from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import Empty from '@/components/Empty'
import useAppStore from '@/store/useAppStore'
import styles from './index.module.scss'

const PriceAlertPage: React.FC = () => {
  const { priceAlerts, removePriceAlert } = useAppStore()

  const handleAddAlert = () => {
    Taro.showModal({
      title: '添加降价提醒',
      content: '请到教材详情页设置降价提醒',
      showCancel: false,
      confirmColor: '#22C55E',
      success: () => {
        Taro.showToast({ title: '请到教材详情页设置降价提醒', icon: 'none' })
      }
    })
  }

  const handleCancelAlert = (id: string, bookTitle: string) => {
    Taro.showModal({
      title: '取消提醒',
      content: `确定要取消《${bookTitle}》的降价提醒吗？`,
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          removePriceAlert(id)
          Taro.showToast({ title: '已取消', icon: 'success' })
        }
      }
    })
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.listContainer}>
        <View className={styles.headerBar}>
          <Text className={styles.statsText}>
            <Text className={styles.statsNum}>{priceAlerts.length}</Text>个降价提醒中
          </Text>
          <Button className={styles.addBtn} onClick={handleAddAlert}>
            + 添加提醒
          </Button>
        </View>

        {priceAlerts.length > 0 ? (
          <View className={styles.alertList}>
            {priceAlerts.map((alert) => (
              <View key={alert.id} className={styles.alertCard}>
                <View className={styles.cardLeft}>
                  <View className={styles.cardTop}>
                    <Text className={styles.bookTitle}>{alert.bookTitle}</Text>
                    <Text className={styles.bookIsbn}>ISBN：{alert.isbn}</Text>
                  </View>
                  <View className={styles.cardBottom}>
                    <View className={styles.priceInfo}>
                      <Text className={styles.priceYen}>¥</Text>
                      <Text className={styles.targetPrice}>{alert.targetPrice}</Text>
                    </View>
                    <Text className={styles.createdTime}>{alert.createdAt}</Text>
                  </View>
                </View>
                <View className={styles.cardRight}>
                  <Button
                    className={styles.cancelBtn}
                    onClick={() => handleCancelAlert(alert.id, alert.bookTitle)}
                  >
                    取消提醒
                  </Button>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Empty
            icon='🔔'
            title='暂无降价提醒'
            desc='在教材详情页可以设置降价提醒，低于目标价自动通知你'
          />
        )}
      </ScrollView>
    </View>
  )
}

export default PriceAlertPage
