import React, { useState, useMemo } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import Empty from '@/components/Empty'
import Tag from '@/components/Tag'
import useAppStore from '@/store/useAppStore'
import { Order, ORDER_STATUS_LABEL, OrderStatus } from '@/types'
import classnames from 'classnames'
import styles from './index.module.scss'

const STATUS_TABS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '待确认', value: 'pending' },
  { label: '已预留', value: 'reserved' },
  { label: '待交付', value: 'delivering' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
  { label: '举报中', value: 'reported' }
]

const OrderPage: React.FC = () => {
  const { orders, updateOrderStatus, rateOrder, reportOrder, currentUser } = useAppStore()
  const [role, setRole] = useState<'buy' | 'sell'>('buy')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [ratingComment, setRatingComment] = useState('')

  const displayedOrders = useMemo(() => {
    let result = orders.filter(o => {
      if (role === 'buy') return o.buyerId === 'me'
      return o.sellerId === 'me'
    })
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter)
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders, role, statusFilter])

  const handleAction = (order: Order, action: string) => {
    switch (action) {
      case 'confirm':
        updateOrderStatus(order.id, 'reserved')
        Taro.showToast({ title: '已确认预留', icon: 'success' })
        break
      case 'deliver':
        updateOrderStatus(order.id, 'delivering')
        Taro.showToast({ title: '等待买家确认交付', icon: 'none' })
        break
      case 'complete':
        setRatingOrderId(order.id)
        setRating(5)
        Taro.showModal({
          title: '确认收货',
          content: '请确认已收到教材并核对无误',
          success: (res) => {
            if (res.confirm) {
              showRatingModal()
            }
          }
        })
        break
      case 'cancel':
        Taro.showModal({
          title: '取消订单',
          content: '确定要取消这笔订单吗？',
          success: (res) => {
            if (res.confirm) {
              updateOrderStatus(order.id, 'cancelled')
              Taro.showToast({ title: '订单已取消', icon: 'none' })
            }
          }
        })
        break
      case 'report':
        Taro.showActionSheet({
          itemList: ['图书与描述不符', '卖家态度恶劣', '约定时间爽约', '其他问题'],
          success: () => {
            reportOrder(order.id)
            Taro.showToast({ title: '举报已提交', icon: 'success' })
          }
        })
        break
      case 'contact':
        Taro.switchTab({ url: '/pages/chat/index' })
        break
    }
  }

  const showRatingModal = () => {
    Taro.showActionSheet({
      itemList: ['⭐⭐⭐⭐⭐ 非常满意', '⭐⭐⭐⭐ 比较满意', '⭐⭐⭐ 一般', '⭐⭐ 不太满意', '⭐ 非常不满'],
      success: (res) => {
        const starRating = 5 - res.tapIndex
        setRating(starRating)
        Taro.showModal({
          title: `评价订单（${'★'.repeat(starRating)}${'☆'.repeat(5 - starRating)}）`,
          editable: true,
          placeholderText: '写下你的交易体验，帮助其他同学...',
          success: (res2) => {
            if (res2.confirm && ratingOrderId) {
              rateOrder(ratingOrderId, starRating, res2.content || '好评！')
              setRatingOrderId(null)
              Taro.showToast({ title: '评价成功', icon: 'success' })
            }
          }
        })
      }
    })
  }

  const getActions = (order: Order): { label: string; action: string; type: string }[] => {
    const actions: { label: string; action: string; type: string }[] = []
    const isBuyer = order.buyerId === 'me'

    actions.push({ label: '联系对方', action: 'contact', type: 'outline' })

    switch (order.status) {
      case 'pending':
        if (isBuyer) {
          actions.push({ label: '取消订单', action: 'cancel', type: 'danger' })
        } else {
          actions.push({ label: '确认预留', action: 'confirm', type: 'primary' })
        }
        break
      case 'reserved':
        if (!isBuyer) {
          actions.push({ label: '标记已约', action: 'deliver', type: 'primary' })
        }
        actions.push({ label: '取消订单', action: 'cancel', type: 'danger' })
        break
      case 'delivering':
        if (isBuyer) {
          actions.push({ label: '确认收货', action: 'complete', type: 'primary' })
        }
        break
      case 'completed':
        if (!order.rating && isBuyer) {
          actions.push({ label: '去评价', action: 'complete', type: 'primary' })
        }
        actions.push({ label: '举报', action: 'report', type: 'danger' })
        break
      default:
        break
    }
    return actions
  }

  const getBtnClass = (type: string) => {
    switch (type) {
      case 'primary': return styles.btnPrimary
      case 'danger': return styles.btnDanger
      default: return styles.btnOutline
    }
  }

  return (
    <View className={styles.page}>
      <View className={styles.roleTabs}>
        <View
          className={classnames(styles.roleTab, role === 'buy' && styles.active)}
          onClick={() => setRole('buy')}
        >
          🛒 我买到的
        </View>
        <View
          className={classnames(styles.roleTab, role === 'sell' && styles.active)}
          onClick={() => setRole('sell')}
        >
          📚 我卖出的
        </View>
      </View>

      <View className={styles.statusTabs}>
        {STATUS_TABS.map(tab => (
          <View
            key={tab.value}
            className={classnames(styles.statusTab, statusFilter === tab.value && styles.active)}
            onClick={() => setStatusFilter(tab.value)}
          >
            <View className={styles.statusDot} />
            {tab.label}
          </View>
        ))}
      </View>

      <View className={styles.orderList}>
        {displayedOrders.length > 0 ? (
          displayedOrders.map(order => (
            <View key={order.id} className={styles.orderCard}>
              <View className={styles.orderHeader}>
                <View className={styles.orderInfo}>
                  <Text className={styles.orderId}>订单号：{order.id.toUpperCase()}</Text>
                  <Tag
                    text={order.type === 'sell' ? '出售' : order.type === 'buy' ? '求购' : '换书'}
                    type={order.type === 'sell' ? 'primary' : order.type === 'buy' ? 'orange' : 'blue'}
                  />
                </View>
                <Text className={classnames(styles.orderStatus, styles[order.status])}>
                  {ORDER_STATUS_LABEL[order.status]}
                </Text>
              </View>

              <View className={styles.orderBody}>
                <Image
                  className={styles.bookImage}
                  src={order.bookImage}
                  mode="aspectFill"
                />
                <View className={styles.bookInfo}>
                  <View>
                    <Text className={styles.bookTitle}>{order.bookTitle}</Text>
                    <Text className={styles.bookMeta}>
                      {role === 'buy' ? `卖家：${order.sellerName}` : `买家：${order.buyerName}`}
                    </Text>
                    <View className={styles.orderDetails}>
                      {order.pickupLocation && (
                        <View className={styles.detailRow}>
                          <Text className={styles.detailIcon}>📍</Text>
                          <Text>{order.pickupLocation}</Text>
                        </View>
                      )}
                      {order.appointmentTime && (
                        <View className={styles.detailRow}>
                          <Text className={styles.detailIcon}>⏰</Text>
                          <Text>{order.appointmentTime}</Text>
                        </View>
                      )}
                      {order.rating && (
                        <View className={styles.detailRow}>
                          <Text className={styles.detailIcon}>⭐</Text>
                          <Text>{'★'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}</Text>
                        </View>
                      )}
                      {order.comment && (
                        <View className={styles.detailRow}>
                          <Text className={styles.detailIcon}>💬</Text>
                          <Text className={styles.commentText}>{order.comment}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View className={styles.priceRow}>
                    <Text className={styles.roleLabel}>
                      {role === 'buy' ? '实付款' : '收款'}
                    </Text>
                    <Text className={styles.price}>¥{order.price}</Text>
                  </View>
                </View>
              </View>

              <View className={styles.orderFooter}>
                {getActions(order).map((a, idx) => (
                  <Button
                    key={idx}
                    className={classnames(styles.btn, getBtnClass(a.type))}
                    onClick={() => handleAction(order, a.action)}
                  >
                    {a.label}
                  </Button>
                ))}
              </View>
            </View>
          ))
        ) : (
          <Empty
            icon="📋"
            title={role === 'buy' ? '暂无购买订单' : '暂无出售订单'}
            desc={role === 'buy' ? '快去首页淘几本心仪的教材吧~' : '闲置的教材可以挂出来卖啦~'}
            actionText="去逛逛"
            onAction={() => Taro.switchTab({ url: '/pages/home/index' })}
          />
        )}
      </View>
    </View>
  )
}

export default OrderPage
