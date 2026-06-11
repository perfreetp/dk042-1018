import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BookCard from '@/components/BookCard'
import Empty from '@/components/Empty'
import Tag from '@/components/Tag'
import useAppStore from '@/store/useAppStore'
import { Book } from '@/types'
import styles from './index.module.scss'

const HISTORY_KEY = 'search_history'

const SearchPage: React.FC = () => {
  const { books, searchBooks, addBrowseHistory, setCurrentBook } = useAppStore()
  const [keyword, setKeyword] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const hotTags = [
    '高等数学', '数据结构', '计算机网络', '操作系统',
    '经济学原理', '大学英语', '有机化学', '线性代数',
    '算法导论', '大学物理', '概率论', '市场营销'
  ]

  useEffect(() => {
    const history = Taro.getStorageSync(HISTORY_KEY)
    if (history) {
      try {
        setSearchHistory(JSON.parse(history))
      } catch {
        setSearchHistory([])
      }
    }
  }, [])

  const saveHistory = (kw: string) => {
    if (!kw.trim()) return
    const newHistory = [kw, ...searchHistory.filter(h => h !== kw)].slice(0, 10)
    setSearchHistory(newHistory)
    Taro.setStorageSync(HISTORY_KEY, JSON.stringify(newHistory))
  }

  const clearHistory = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          setSearchHistory([])
          Taro.removeStorageSync(HISTORY_KEY)
        }
      }
    })
  }

  const handleSearch = () => {
    if (!keyword.trim()) {
      Taro.showToast({ title: '请输入搜索内容', icon: 'none' })
      return
    }
    setHasSearched(true)
    saveHistory(keyword.trim())
  }

  const handleTagClick = (tag: string) => {
    setKeyword(tag)
    setHasSearched(true)
    saveHistory(tag)
  }

  const handleScan = async () => {
    try {
      const res = await Taro.scanCode({ scanType: ['barCode', 'qrCode'] })
      if (res.result) {
        setKeyword(res.result)
        setHasSearched(true)
        saveHistory(res.result)
      }
    } catch {
      Taro.showToast({ title: '扫码取消', icon: 'none' })
    }
  }

  const handleBookClick = (book: Book) => {
    setCurrentBook(book)
    addBrowseHistory(book)
    Taro.navigateTo({ url: '/pages/detail/index' })
  }

  const searchResults = useMemo(() => {
    if (!hasSearched || !keyword.trim()) return []
    return searchBooks(keyword)
  }, [hasSearched, keyword, books, searchBooks])

  const showHistory = !hasSearched && searchHistory.length > 0
  const showHotTags = !hasSearched
  const showResults = hasSearched

  return (
    <View className={styles.page}>
      <View className={styles.searchHeader}>
        <View className={styles.searchBox}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
            placeholder='搜索书名、作者、ISBN、课程'
            confirmType='search'
            focus
          />
          {keyword && (
            <View className={styles.clearBtn} onClick={() => setKeyword('')}>
              <Text className={styles.clearIcon}>✕</Text>
            </View>
          )}
        </View>
        <View className={styles.scanBtn} onClick={handleScan}>
          <Text className={styles.scanIcon}>📷</Text>
        </View>
        <View className={styles.searchBtn} onClick={handleSearch}>
          <Text className={styles.searchBtnText}>搜索</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.scrollContent}>
        {showHistory && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>搜索历史</Text>
              <View className={styles.clearHistoryBtn} onClick={clearHistory}>
                <Text className={styles.clearHistoryText}>清空</Text>
              </View>
            </View>
            <View className={styles.tagList}>
              {searchHistory.map((item, idx) => (
                <View
                  key={idx}
                  className={styles.historyTag}
                  onClick={() => handleTagClick(item)}
                >
                  <Text className={styles.historyTagText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {showHotTags && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>热门搜索</Text>
              <Text className={styles.fireIcon}>🔥</Text>
            </View>
            <View className={styles.tagList}>
              {hotTags.map((tag, idx) => (
                <Tag
                  key={idx}
                  text={tag}
                  type={idx < 3 ? 'primary' : 'gray'}
                  size='normal'
                  onClick={() => handleTagClick(tag)}
                />
              ))}
            </View>
          </View>
        )}

        {showResults && (
          <View className={styles.resultsSection}>
            <View className={styles.resultsHeader}>
              <Text className={styles.resultsCount}>
                找到 <Text className={styles.countNum}>{searchResults.length}</Text> 本相关教材
              </Text>
              {keyword && (
                <View className={styles.keywordTag}>
                  <Text className={styles.keywordText}>"{keyword}"</Text>
                </View>
              )}
            </View>

            {searchResults.length > 0 ? (
              <View className={styles.bookList}>
                {searchResults.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={() => handleBookClick(book)}
                  />
                ))}
              </View>
            ) : (
              <Empty
                icon='🔍'
                title='没有找到相关教材'
                desc='试试其他关键词，或调整搜索条件'
              />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default SearchPage
