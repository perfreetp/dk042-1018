import React, { useState, useRef, useEffect } from 'react'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import useAppStore from '@/store/useAppStore'
import { ChatMessage } from '@/types'
import classnames from 'classnames'
import styles from './index.module.scss'

const ChatDetailPage: React.FC = () => {
  const { activeChat, currentUser, addChatMessage, setCurrentBook, books } = useAppStore()
  const [inputText, setInputText] = useState('')
  const scrollRef = useRef<any>(null)

  useDidShow(() => {
    if (!activeChat) {
      Taro.showToast({ title: '请先选择一个会话', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 1500)
    }
  })

  useEffect(() => {
    if (scrollRef.current && activeChat?.messages.length) {
      setTimeout(() => {
        scrollRef.current?.scrollToOffset({
          offset: 999999,
          animated: true
        })
      }, 100)
    }
  }, [activeChat?.messages.length])

  if (!activeChat) {
    return <View className={styles.page} />
  }

  const chat = activeChat
  const isMe = (senderId: string) => senderId === currentUser.id

  const book = books.find(b => b.id === chat.bookId)

  const handleBookClick = () => {
    if (book) {
      setCurrentBook(book)
      Taro.navigateTo({ url: '/pages/detail/index' })
    }
  }

  const sendTextMessage = () => {
    const content = inputText.trim()
    if (!content) return
    addChatMessage(chat.id, {
      type: 'text',
      content,
      senderId: currentUser.id
    })
    setInputText('')
  }

  const handlePrice = () => {
    Taro.showActionSheet({
      itemList: ['¥20', '¥30', '¥40', '自定义价格'],
      success: (res) => {
        const idx = res.tapIndex
        if (idx < 3) {
          const prices = [20, 30, 40]
          const price = prices[idx]
          addChatMessage(chat.id, {
            type: 'price',
            content: `询价 ¥${price}`,
            senderId: currentUser.id,
            price
          })
        } else {
          Taro.showModal({
            title: '自定义价格',
            editable: true,
            placeholderText: '请输入金额',
            success: (r) => {
              if (r.confirm && r.content) {
                const price = parseInt(r.content, 10)
                if (price > 0) {
                  addChatMessage(chat.id, {
                    type: 'price',
                    content: `询价 ¥${price}`,
                    senderId: currentUser.id,
                    price
                  })
                } else {
                  Taro.showToast({ title: '请输入有效金额', icon: 'none' })
                }
              }
            }
          })
        }
      }
    })
  }

  const handleTime = () => {
    const options = ['今天下午3点', '明天上午10点', '明天下午2点', '自定义时间']
    const times = [
      new Date().toISOString().slice(0, 10) + ' 15:00',
      new Date(Date.now() + 86400000).toISOString().slice(0, 10) + ' 10:00',
      new Date(Date.now() + 86400000).toISOString().slice(0, 10) + ' 14:00'
    ]
    Taro.showActionSheet({
      itemList: options,
      success: (res) => {
        const idx = res.tapIndex
        if (idx < 3) {
          const appointmentTime = times[idx]
          addChatMessage(chat.id, {
            type: 'time',
            content: `约见时间 ${options[idx]}`,
            senderId: currentUser.id,
            appointmentTime
          })
        } else {
          Taro.showModal({
            title: '自定义时间',
            editable: true,
            placeholderText: '如：2026-06-15 14:30',
            success: (r) => {
              if (r.confirm && r.content) {
                addChatMessage(chat.id, {
                  type: 'time',
                  content: `约见时间 ${r.content}`,
                  senderId: currentUser.id,
                  appointmentTime: r.content
                })
              }
            }
          })
        }
      }
    })
  }

  const handleLocation = () => {
    const locations = ['图书馆门口', '南区食堂', '西门咖啡厅']
    Taro.showActionSheet({
      itemList: [...locations, '自定义位置'],
      success: (res) => {
        const idx = res.tapIndex
        if (idx < 3) {
          const address = locations[idx]
          addChatMessage(chat.id, {
            type: 'location',
            content: `校内位置 ${address}`,
            senderId: currentUser.id,
            location: { lat: 0, lng: 0, address }
          })
        } else {
          Taro.showModal({
            title: '自定义位置',
            editable: true,
            placeholderText: '请输入校内位置',
            success: (r) => {
              if (r.confirm && r.content) {
                addChatMessage(chat.id, {
                  type: 'location',
                  content: `校内位置 ${r.content}`,
                  senderId: currentUser.id,
                  location: { lat: 0, lng: 0, address: r.content }
                })
              }
            }
          })
        }
      }
    })
  }

  const renderMessageContent = (msg: ChatMessage) => {
    switch (msg.type) {
      case 'text':
        return (
          <View className={styles.bubble}>
            <Text className={styles.bubbleText}>{msg.content}</Text>
          </View>
        )
      case 'image':
        return (
          <View className={styles.bubble}>
            <View className={styles.bubbleMeta}>
              <Text className={styles.metaIcon}>🖼️</Text>
              <Text className={styles.metaLabel}>[图片]</Text>
            </View>
          </View>
        )
      case 'location':
        return (
          <View className={styles.bubble}>
            <View className={styles.bubbleMeta}>
              <Text className={styles.metaIcon}>📍</Text>
              <Text className={styles.metaLabel}>[校内位置]</Text>
            </View>
            <Text className={styles.metaValue}>{msg.location?.address}</Text>
          </View>
        )
      case 'time':
        return (
          <View className={styles.bubble}>
            <View className={styles.bubbleMeta}>
              <Text className={styles.metaIcon}>🕐</Text>
              <Text className={styles.metaLabel}>[约见时间]</Text>
            </View>
            <Text className={styles.metaValue}>{msg.appointmentTime}</Text>
          </View>
        )
      case 'price':
        return (
          <View className={styles.bubble}>
            <View className={styles.bubbleMeta}>
              <Text className={styles.metaIcon}>💰</Text>
              <Text className={styles.metaLabel}>[询价]</Text>
            </View>
            <Text className={styles.metaValue}>¥{msg.price}</Text>
          </View>
        )
      default:
        return null
    }
  }

  return (
    <View className={styles.page}>
      <View className={styles.bookHeader} onClick={handleBookClick}>
        <Image
          className={styles.bookThumb}
          src={book?.images[0]?.url || 'https://picsum.photos/seed/book/200/260'}
          mode="aspectFill"
        />
        <View className={styles.bookInfo}>
          <Text className={styles.bookTitle}>{chat.bookTitle}</Text>
          <Text className={styles.bookDesc}>点击查看详情</Text>
        </View>
        <Text className={styles.arrowIcon}>›</Text>
      </View>

      <ScrollView
        className={styles.messageList}
        scrollY
        ref={scrollRef}
        enhanced
        showScrollbar={false}
      >
        {chat.messages.map((msg, idx) => {
          const mine = isMe(msg.senderId)
          return (
            <View
              key={msg.id}
              className={classnames(styles.messageItem, mine && styles.mine)}
            >
              {!mine ? (
                <Image
                  className={styles.avatar}
                  src={chat.userAvatar}
                  mode="aspectFill"
                />
              ) : (
                <View className={styles.leftGap} />
              )}
              <View className={styles.messageContent}>
                {renderMessageContent(msg)}
              </View>
              {mine ? (
                <Image
                  className={styles.avatar}
                  src={currentUser.avatar}
                  mode="aspectFill"
                />
              ) : (
                <View className={styles.rightGap} />
              )}
            </View>
          )
        })}
      </ScrollView>

      <View className={styles.toolbar}>
        <View className={styles.toolBtn} onClick={handlePrice}>
          <Text className={styles.toolIcon}>💰</Text>
          <Text>询价</Text>
        </View>
        <View className={styles.toolBtn} onClick={handleTime}>
          <Text className={styles.toolIcon}>🕐</Text>
          <Text>约时间</Text>
        </View>
        <View className={styles.toolBtn} onClick={handleLocation}>
          <Text className={styles.toolIcon}>📍</Text>
          <Text>发定位</Text>
        </View>
      </View>

      <View className={styles.inputBar}>
        <Input
          className={styles.input}
          placeholder="说点什么..."
          value={inputText}
          onInput={(e) => setInputText(e.detail.value)}
          onConfirm={sendTextMessage}
          confirmType="send"
        />
        <View className={styles.sendBtn} onClick={sendTextMessage}>
          <Text>发送</Text>
        </View>
      </View>
    </View>
  )
}

export default ChatDetailPage
