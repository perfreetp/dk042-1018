import React, { useState, useMemo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import SearchBar from '@/components/SearchBar'
import Empty from '@/components/Empty'
import useAppStore from '@/store/useAppStore'
import classnames from 'classnames'
import styles from './index.module.scss'

const ChatPage: React.FC = () => {
  const { chats, setActiveChat } = useAppStore()
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [keyword, setKeyword] = useState('')

  const displayedChats = useMemo(() => {
    let result = [...chats]
    if (activeTab === 'unread') {
      result = result.filter(c => c.unreadCount > 0)
    }
    if (keyword) {
      const kw = keyword.toLowerCase()
      result = result.filter(c =>
        c.userName.toLowerCase().includes(kw) ||
        c.lastMessage.toLowerCase().includes(kw) ||
        c.bookTitle.toLowerCase().includes(kw)
      )
    }
    return result.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
  }, [chats, activeTab, keyword])

  const handleChatClick = (chat) => {
    setActiveChat(chat)
    Taro.navigateTo({ url: '/pages/chat-detail/index' })
  }

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const oneDay = 24 * 60 * 60 * 1000

    if (diff < 60 * 1000) return '刚刚'
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < oneDay) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < oneDay * 2) return '昨天'
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <View className={styles.page}>
      <View className={styles.searchWrap}>
        <SearchBar
          placeholder="搜索聊天记录"
          onChange={setKeyword}
          onSearch={() => {}}
        />
      </View>

      <View className={styles.tabs}>
        <View
          className={classnames(styles.tab, activeTab === 'all' && styles.active)}
          onClick={() => setActiveTab('all')}
        >
          全部消息
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'unread' && styles.active)}
          onClick={() => setActiveTab('unread')}
        >
          未读 {totalUnread > 0 && `(${totalUnread})`}
        </View>
      </View>

      <View className={styles.chatList}>
        {displayedChats.length > 0 ? (
          displayedChats.map(chat => (
            <View
              key={chat.id}
              className={styles.chatItem}
              onClick={() => handleChatClick(chat)}
            >
              <View className={styles.avatarWrap}>
                <Image
                  className={styles.avatar}
                  src={chat.userAvatar}
                  mode="aspectFill"
                />
                {chat.unreadCount > 0 && (
                  <View className={styles.unreadBadge}>
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </View>
                )}
              </View>
              <View className={styles.chatContent}>
                <View className={styles.chatTop}>
                  <Text className={styles.chatName}>{chat.userName}</Text>
                  <Text className={styles.chatTime}>{formatTime(chat.lastMessageTime)}</Text>
                </View>
                <View className={styles.chatBottom}>
                  <Text className={styles.chatPreview}>{chat.lastMessage}</Text>
                  <Text className={styles.chatBook}>{chat.bookTitle}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyWrap}>
            <Empty
              icon="💬"
              title={activeTab === 'unread' ? '暂无未读消息' : '暂无聊天记录'}
              desc={activeTab === 'unread' ? '所有消息都已读啦~' : '快去首页看看感兴趣的教材，和卖家聊聊吧！'}
              actionText="去逛逛"
              onAction={() => Taro.switchTab({ url: '/pages/home/index' })}
            />
          </View>
        )}
      </View>
    </View>
  )
}

export default ChatPage
