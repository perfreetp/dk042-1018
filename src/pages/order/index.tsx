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

const REPORT_REASONS = [
  '图书与描述不符',
  '对方态度恶劣',
  '约定时间爽约',
  '价格争议',
  '其他问题'
]

const PICKUP_LOCATIONS = [
  '图书馆门口', '南区食堂', '北区食堂', '东区宿舍楼',
  '西门咖啡厅', '中心食堂', '教学楼大厅', '校门口'
]

const OrderPage: React.FC = () => {
  const { orders, updateOrderStatus, rateOrder, reportOrder, currentUser, updateOrderAppointment, chats, addChatMessage } = useAppStore()
  const [role, setRole] = useState<'buy' | 'sell'>('buy')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [pendingRatingOrderId, setPendingRatingOrderId] = useState<string | null>(null)

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

  const findChatByBookId = (bookId: string) => {
    return chats.find(c => c.bookId === bookId)
  }

  const syncAppointmentToChat = (order: Order, newLocation: string, newTime: string) => {
    const chat = findChatByBookId(order.bookId)
    if (!chat) return
    const parts: string[] = []
    if (newLocation) parts.push(`📍地点改为：${newLocation}`)
    if (newTime) parts.push(`⏰时间改为：${newTime}`)
    if (parts.length > 0) {
      addChatMessage(chat.id, {
        type: 'text',
        content: `【约见信息更新】${parts.join('，')}`,
        senderId: currentUser.id
      })
    }
  }

  const handleAction = (order: Order, action: string) => {
    switch (action) {
      case 'confirm':
        updateOrderStatus(order.id, 'reserved')
        Taro.showToast({ title: '已确认预留', icon: 'success' })
        break
      case 'deliver':
        updateOrderStatus(order.id, 'delivering')
        Taro.showToast({ title: '已标记约见，等待买家确认收货', icon: 'none' })
        break
      case 'complete':
        Taro.showModal({
          title: '确认收货',
          content: '请确认已收到教材并核对无误',
          success: (res) => {
            if (res.confirm) {
              setPendingRatingOrderId(order.id)
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
        handleReport(order)
        break
      case 'contact':
        Taro.switchTab({ url: '/pages/chat/index' })
        break
      case 'editAppointment':
        handleEditAppointment(order)
        break
    }
  }

  const handleReport = (order: Order) => {
    if (order.status === 'reported') {
      Taro.showToast({ title: '该订单已在举报处理中', icon: 'none' })
      return
    }
    Taro.showActionSheet({
      itemList: REPORT_REASONS,
      success: (res) => {
        const reason = REPORT_REASONS[res.tapIndex]
        if (reason === '其他问题') {
          Taro.showModal({
            title: '请说明举报原因',
            editable: true,
            placeholderText: '请详细描述遇到的问题...',
            success: (res2) => {
              if (res2.confirm) {
                reportOrder(order.id, res2.content || reason)
                Taro.showToast({ title: '举报已提交', icon: 'success' })
              }
            }
          })
        } else {
          reportOrder(order.id, reason)
          Taro.showToast({ title: '举报已提交', icon: 'success' })
        }
      }
    })
  }

  const handleEditAppointment = (order: Order) => {
    Taro.showActionSheet({
      itemList: ['修改取书地点', '修改见面时间', '同时修改地点和时间'],
      success: (res) => {
        const tapIndex = res.tapIndex
        if (tapIndex === 0) {
          Taro.showActionSheet({
            itemList: PICKUP_LOCATIONS,
            success: (r) => {
              const loc = PICKUP_LOCATIONS[r.tapIndex]
              updateOrderAppointment(order.id, loc, order.appointmentTime || '')
              syncAppointmentToChat(order, loc, '')
              Taro.showToast({ title: '地点已更新', icon: 'success' })
            }
          })
        } else if (tapIndex === 1) {
          Taro.showModal({
            title: '修改见面时间',
            editable: true,
            placeholderText: '例如：明天下午3点',
            content: order.appointmentTime || '',
            success: (r) => {
              if (r.confirm) {
                updateOrderAppointment(order.id, order.pickupLocation || '', r.content || '')
                syncAppointmentToChat(order, '', r.content || '')
                Taro.showToast({ title: '时间已更新', icon: 'success' })
              }
            }
          })
        } else {
          Taro.showActionSheet({
            itemList: PICKUP_LOCATIONS,
            success: (r1) => {
              const loc = PICKUP_LOCATIONS[r1.tapIndex]
              Taro.showModal({
                title: '修改见面时间',
                editable: true,
                placeholderText: '例如：明天下午3点',
                success: (r2) => {
                  if (r2.confirm) {
                    const time = r2.content || order.appointmentTime || ''
                    updateOrderAppointment(order.id, loc, time)
                    syncAppointmentToChat(order, loc, time)
                    Taro.showToast({ title: '约见信息已更新', icon: 'success' })
                  }
                }
              })
            }
          })
        }
      }
    })
  }

  const submitRating = (orderId: string, starRating: number) => {
    Taro.showModal({
      title: `评价订单（${'★'.repeat(starRating)}${'☆'.repeat(5 - starRating)}）`,
      editable: true,
      placeholderText: '写下你的交易体验，帮助其他同学...',
      success: (res) => {
        if (res.confirm) {
          rateOrder(orderId, starRating, res.content || '好评！')
          setPendingRatingOrderId(null)
          Taro.showToast({ title: '评价成功，订单已完成', icon: 'success' })
        }
      }
    })
  }

  const handleSelectRating = () => {
    if (!pendingRatingOrderId) return
    Taro.showActionSheet({
      itemList: ['⭐⭐⭐⭐⭐ 非常满意', '⭐⭐⭐⭐ 比较满意', '⭐⭐⭐ 一般', '⭐⭐ 不太满意', '⭐ 非常不满'],
      success: (res) => {
        const starRating = 5 - res.tapIndex
        submitRating(pendingRatingOrderId, starRating)
      }
    })
  }

  const getTimeline = (order: Order) => {
    const steps: { label: string; time?: string; active: boolean }[] = []
    steps.push({ label: '下单成功', time: order.createdAt, active: true })
    if (order.reservedAt || ['reserved', 'delivering', 'completed'].includes(order.status)) {
      steps.push({ label: '已预留', time: order.reservedAt, active: ['reserved', 'delivering', 'completed'].includes(order.status) })
    }
    if (order.appointmentSetAt || order.deliveringAt || ['delivering', 'completed'].includes(order.status)) {
      steps.push({ label: '已约见', time: order.appointmentSetAt || order.deliveringAt, active: ['delivering', 'completed'].includes(order.status) })
    }
    if (order.completedAt || order.status === 'completed') {
      steps.push({ label: '已完成', time: order.completedAt, active: order.status === 'completed' })
    }
    if (order.status === 'cancelled') {
      steps.push({ label: '已取消', active: true })
    }
    if (order.status === 'reported') {
      steps.push({ label: '举报中', active: true })
    }
    return steps
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
        actions.push({ label: '修改约见', action: 'editAppointment', type: 'outline' })
        actions.push({ label: '取消订单', action: 'cancel', type: 'danger' })
        break
      case 'delivering':
        if (isBuyer) {
          actions.push({ label: '确认收货', action: 'complete', type: 'primary' })
        }
        actions.push({ label: '修改约见', action: 'editAppointment', type: 'outline' })
        break
      case 'completed':
        if (!order.rating && isBuyer) {
          actions.push({ label: '去评价', action: 'complete', type: 'primary' })
        }
        if (order.status !== 'reported') {
          actions.push({ label: '举报', action: 'report', type: 'danger' })
        }
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

  const getNextHint = (order: Order): string => {
    const isBuyer = order.buyerId === 'me'
    switch (order.status) {
      case 'pending':
        return isBuyer ? '等待卖家确认预留' : '请尽快确认是否预留'
      case 'reserved':
        return isBuyer ? '等待卖家标记约见时间' : '请与买家约见后标记已约'
      case 'delivering':
        return isBuyer ? '收到教材后请确认收货并评价' : '等待买家确认收货'
      case 'completed':
        if (!order.rating && isBuyer) return '请对本次交易进行评价'
        return '交易已完成'
      case 'reported':
        return '举报处理中，请耐心等待'
      default:
        return ''
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

      {pendingRatingOrderId && (
        <View className={styles.ratingBanner} onClick={handleSelectRating}>
          <Text className={styles.ratingBannerIcon}>⭐</Text>
          <Text className={styles.ratingBannerText}>已确认收货，点击选择星级并评价</Text>
          <Text className={styles.ratingBannerArrow}>›</Text>
        </View>
      )}

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
                  </View>
                  <View className={styles.priceRow}>
                    <Text className={styles.roleLabel}>
                      {role === 'buy' ? '实付款' : '收款'}
                    </Text>
                    <Text className={styles.price}>¥{order.price}</Text>
                  </View>
                </View>
              </View>

              <View className={styles.timelineSection}>
                {getTimeline(order).map((step, idx) => (
                  <View key={idx} className={classnames(styles.timelineItem, step.active && styles.timelineActive)}>
                    <View className={styles.timelineLeft}>
                      <View className={styles.timelineDot} />
                      {idx < getTimeline(order).length - 1 && <View className={styles.timelineLine} />}
                    </View>
                    <View className={styles.timelineRight}>
                      <Text className={styles.timelineLabel}>{step.label}</Text>
                      {step.time && <Text className={styles.timelineTime}>{step.time}</Text>}
                    </View>
                  </View>
                ))}
              </View>

              <View className={styles.appointmentSection}>
                <View className={styles.appointmentHeader}>
                  <Text className={styles.appointmentTitle}>📋 约见信息</Text>
                  {(order.status === 'reserved' || order.status === 'delivering') && (
                    <Text className={styles.appointmentEdit} onClick={() => handleAction(order, 'editAppointment')}>修改</Text>
                  )}
                </View>
                <View className={styles.appointmentDetails}>
                  {order.pickupLocation ? (
                    <View className={styles.detailRow}>
                      <Text className={styles.detailIcon}>📍</Text>
                      <Text>{order.pickupLocation}</Text>
                    </View>
                  ) : (
                    <View className={styles.detailRow}>
                      <Text className={styles.detailIcon}>📍</Text>
                      <Text className={styles.detailEmpty}>暂未约定地点</Text>
                    </View>
                  )}
                  {order.appointmentTime ? (
                    <View className={styles.detailRow}>
                      <Text className={styles.detailIcon}>⏰</Text>
                      <Text>{order.appointmentTime}</Text>
                    </View>
                  ) : (
                    <View className={styles.detailRow}>
                      <Text className={styles.detailIcon}>⏰</Text>
                      <Text className={styles.detailEmpty}>暂未约定时间</Text>
                    </View>
                  )}
                </View>
              </View>

              {order.status === 'reported' && order.reportReason && (
                <View className={styles.reportSection}>
                  <View className={styles.detailRow}>
                    <Text className={styles.detailIcon}>�</Text>
                    <Text className={styles.reportReason}>举报原因：{order.reportReason}</Text>
                  </View>
                </View>
              )}

              {order.rating && (
                <View className={styles.ratingSection}>
                  <View className={styles.detailRow}>
                    <Text className={styles.detailIcon}>⭐</Text>
                    <Text>{'★'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}</Text>
                  </View>
                  {order.comment && (
                    <View className={styles.detailRow}>
                      <Text className={styles.detailIcon}>💬</Text>
                      <Text className={styles.commentText}>{order.comment}</Text>
                    </View>
                  )}
                </View>
              )}

              <View className={styles.nextHint}>
                <Text className={styles.nextHintIcon}>💡</Text>
                <Text className={styles.nextHintText}>{getNextHint(order)}</Text>
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
