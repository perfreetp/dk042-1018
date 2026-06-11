import React, { useState, useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import BookCard from '@/components/BookCard'
import Empty from '@/components/Empty'
import Tag from '@/components/Tag'
import useAppStore from '@/store/useAppStore'
import { FilterOptions, Book } from '@/types'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const { books, filterOptions, setFilterOptions, searchBooks } = useAppStore()
  const [showFilter, setShowFilter] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')

  const filteredBooks = useMemo(() => {
    let result = [...books]

    if (searchKeyword) {
      result = searchBooks(searchKeyword)
    }

    if (filterOptions.type) {
      result = result.filter(b => b.type === filterOptions.type)
    }
    if (filterOptions.college) {
      result = result.filter(b => b.college === filterOptions.college)
    }
    if (filterOptions.condition) {
      result = result.filter(b => b.condition === filterOptions.condition)
    }

    return result
  }, [books, filterOptions, searchKeyword, searchBooks])

  const handleSearchClick = () => {
    Taro.navigateTo({ url: '/pages/search/index' })
  }

  const handlePublish = () => {
    Taro.navigateTo({ url: '/pages/publish/index' })
  }

  const handleFilterChange = (options: FilterOptions) => {
    setFilterOptions(options)
  }

  const handleFilterConfirm = () => {
    setShowFilter(false)
    Taro.showToast({ title: `找到 ${filteredBooks.length} 本`, icon: 'none' })
  }

  const handleTagClick = (tag: string) => {
    setSearchKeyword(tag)
    Taro.showToast({ title: `搜索：${tag}`, icon: 'none' })
  }

  const clearFilter = (key: keyof FilterOptions) => {
    const newOpts = { ...filterOptions }
    delete newOpts[key]
    setFilterOptions(newOpts)
  }

  const hasAnyFilter = filterOptions.type || filterOptions.college || filterOptions.condition

  const hotTags = ['高数', '数据结构', '计算机', '经济学', '英语', '有机化学', '算法', '大学物理']

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View className={styles.logo}>
            <Text className={styles.logoIcon}>📖</Text>
            <Text className={styles.logoText}>校园书易</Text>
          </View>
          <View className={styles.location}>
            <Text className={styles.locationIcon}>📍</Text>
            <Text className={styles.locationText}>XX大学</Text>
          </View>
        </View>

        <SearchBar
          variant="header"
          showScan
          placeholder="搜索书名、作者、ISBN..."
          onClick={handleSearchClick}
          readOnly
        />

        <View className={styles.banner}>
          <Text className={styles.bannerIcon}>🎓</Text>
          <View className={styles.bannerContent}>
            <Text className={styles.bannerTitle}>闲置教材，循环利用</Text>
            <Text className={styles.bannerDesc}>同校交易更放心 · 笔记分享共成长</Text>
          </View>
          <Button className={styles.publishBtn} onClick={handlePublish}>
            + 发布
          </Button>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.quickEntries}>
          <View className={styles.entryItem} onClick={handlePublish}>
            <View className={`${styles.entryIcon} ${styles.entryIcon1}`}>📚</View>
            <Text className={styles.entryText}>卖书</Text>
          </View>
          <View className={styles.entryItem} onClick={handlePublish}>
            <View className={`${styles.entryIcon} ${styles.entryIcon2}`}>🛒</View>
            <Text className={styles.entryText}>求购</Text>
          </View>
          <View className={styles.entryItem} onClick={handlePublish}>
            <View className={`${styles.entryIcon} ${styles.entryIcon3}`}>🔄</View>
            <Text className={styles.entryText}>换书</Text>
          </View>
          <View className={styles.entryItem}>
            <View className={`${styles.entryIcon} ${styles.entryIcon4}`}>🎁</View>
            <Text className={styles.entryText}>捐赠</Text>
          </View>
        </View>

        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <View className={styles.sectionTitleIcon} />
            <Text className={styles.sectionTitleText}>热门搜索</Text>
          </View>
          <Text className={styles.sectionMore}>更多 ›</Text>
        </View>

        <View className={styles.hotTags}>
          {hotTags.map(tag => (
            <View
              key={tag}
              className={styles.hotTag}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </View>
          ))}
        </View>

        <View className={styles.filterToggle}>
          <View className={styles.filterInfo}>
            {hasAnyFilter ? (
              <>
                {filterOptions.type && (
                  <View className={styles.filterActiveTag} onClick={() => clearFilter('type')}>
                    类型：{filterOptions.type === 'sell' ? '出售' : filterOptions.type === 'buy' ? '求购' : '换书'}
                    <Text className={styles.filterClose}>×</Text>
                  </View>
                )}
                {filterOptions.college && (
                  <View className={styles.filterActiveTag} onClick={() => clearFilter('college')}>
                    {filterOptions.college}
                    <Text className={styles.filterClose}>×</Text>
                  </View>
                )}
                {filterOptions.condition && (
                  <View className={styles.filterActiveTag} onClick={() => clearFilter('condition')}>
                    {filterOptions.condition === 'new' ? '全新' : filterOptions.condition === 'like-new' ? '几乎全新' : filterOptions.condition === 'good' ? '良好' : filterOptions.condition === 'fair' ? '一般' : '破旧'}
                    <Text className={styles.filterClose}>×</Text>
                  </View>
                )}
              </>
            ) : (
              <Text className={styles.filterPlaceholder}>筛选：学院、课程、新旧程度</Text>
            )}
          </View>
          <View className={styles.filterBtn} onClick={() => setShowFilter(!showFilter)}>
            <Text className={styles.filterBtnIcon}>⚙</Text>
            <Text>筛选</Text>
          </View>
        </View>

        {showFilter && (
          <FilterBar
            value={filterOptions}
            onChange={handleFilterChange}
            onConfirm={handleFilterConfirm}
          />
        )}

        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <View className={styles.sectionTitleIcon} />
            <Text className={styles.sectionTitleText}>
              {searchKeyword ? `搜索结果 (${filteredBooks.length})` : `为你推荐 (${filteredBooks.length})`}
            </Text>
          </View>
        </View>

        <View className={styles.bookList}>
          {filteredBooks.length > 0 ? (
            filteredBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))
          ) : (
            <Empty
              icon="🔍"
              title="暂无匹配的教材"
              desc="换个关键词试试，或者发布一个求购信息~"
              actionText="发布求购"
              onAction={handlePublish}
            />
          )}
        </View>
      </View>
    </View>
  )
}

export default HomePage
