import React, { useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'

interface SearchBarProps {
  value?: string
  placeholder?: string
  onSearch?: (keyword: string) => void
  onChange?: (keyword: string) => void
  variant?: 'normal' | 'header'
  showScan?: boolean
  onClick?: () => void
  readOnly?: boolean
}

const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  placeholder = '搜索书名、作者、ISBN...',
  onSearch,
  onChange,
  variant = 'normal',
  showScan = false,
  onClick,
  readOnly = false
}) => {
  const [focused, setFocused] = useState(false)
  const [inputValue, setInputValue] = useState(value)

  const handleChange = (v: string) => {
    setInputValue(v)
    onChange?.(v)
  }

  const handleScan = () => {
    Taro.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode', 'qrCode'],
      success: (res) => {
        console.log('[SearchBar] 扫码结果:', res.result)
        const isbn = res.result
        setInputValue(isbn)
        onChange?.(isbn)
        onSearch?.(isbn)
        Taro.showToast({ title: 'ISBN识别成功', icon: 'success' })
      },
      fail: (err) => {
        console.error('[SearchBar] 扫码失败:', err)
        Taro.showToast({ title: '扫码取消', icon: 'none' })
      }
    })
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setInputValue('')
    onChange?.('')
  }

  const wrapClass = variant === 'header' ? styles.headerBar : styles.wrap

  return (
    <View className={wrapClass}>
      <View
        className={classnames(styles.searchInput, focused && styles.focused)}
        onClick={onClick}
      >
        <Text className={styles.icon}>🔍</Text>
        {readOnly ? (
          <Text className={styles.placeholder}>{placeholder}</Text>
        ) : (
          <Input
            className={styles.input}
            value={inputValue}
            placeholder={placeholder}
            placeholderClass={styles.placeholder}
            confirmType="search"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onInput={(e) => handleChange(e.detail.value)}
            onConfirm={(e) => onSearch?.(e.detail.value)}
          />
        )}
        {inputValue && !readOnly && (
          <View className={styles.clearBtn} onClick={handleClear}>×</View>
        )}
      </View>
      {showScan && (
        <View className={styles.scanBtn} onClick={handleScan}>
          <Text className={styles.scanIcon}>📷</Text>
          <Text className={styles.scanText}>扫码</Text>
        </View>
      )}
    </View>
  )
}

export default SearchBar
