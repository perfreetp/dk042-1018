import React, { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import classnames from 'classnames'
import { COLLEGES, CONDITIONS, BOOK_TYPES, BookCondition, BookType, FilterOptions } from '@/types'
import styles from './index.module.scss'

interface FilterBarProps {
  value: FilterOptions
  onChange: (options: FilterOptions) => void
  onConfirm: () => void
}

const FilterBar: React.FC<FilterBarProps> = ({ value, onChange, onConfirm }) => {
  const [localValue, setLocalValue] = useState<FilterOptions>(value)

  const handleTypeChange = (type: BookType) => {
    setLocalValue({ ...localValue, type: localValue.type === type ? undefined : type })
  }

  const handleCollegeChange = (college: string) => {
    setLocalValue({ ...localValue, college: localValue.college === college ? undefined : college })
  }

  const handleConditionChange = (cond: BookCondition) => {
    setLocalValue({ ...localValue, condition: localValue.condition === cond ? undefined : cond })
  }

  const handleConfirm = () => {
    onChange(localValue)
    onConfirm()
  }

  const handleReset = () => {
    setLocalValue({})
    onChange({})
  }

  const handleResetTag = (key: 'type' | 'college' | 'condition') => {
    const newValue = { ...localValue }
    delete newValue[key]
    setLocalValue(newValue)
  }

  return (
    <View className={styles.wrap}>
      <View className={styles.typeTabs}>
        {BOOK_TYPES.map((item) => (
          <View
            key={item.value}
            className={classnames(styles.typeTab, localValue.type === item.value && styles.active)}
            onClick={() => handleTypeChange(item.value)}
          >
            {item.label}
          </View>
        ))}
      </View>

      <View className={styles.filterRow}>
        <View className={styles.label}>
          <Text>所属学院</Text>
          {localValue.college && (
            <Text className={styles.resetBtn} onClick={() => handleResetTag('college')}>清除</Text>
          )}
        </View>
        <View className={styles.tagsWrap}>
          {COLLEGES.slice(0, 8).map((college) => (
            <View
              key={college}
              className={classnames(styles.tagItem, localValue.college === college && styles.active)}
              onClick={() => handleCollegeChange(college)}
            >
              {college}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.filterRow}>
        <View className={styles.label}>
          <Text>新旧程度</Text>
          {localValue.condition && (
            <Text className={styles.resetBtn} onClick={() => handleResetTag('condition')}>清除</Text>
          )}
        </View>
        <View className={styles.tagsWrap}>
          {CONDITIONS.map((item) => (
            <View
              key={item.value}
              className={classnames(styles.tagItem, localValue.condition === item.value && styles.active)}
              onClick={() => handleConditionChange(item.value)}
            >
              {item.label}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.actionBar}>
        <Button className={styles.resetAllBtn} onClick={handleReset}>重置</Button>
        <Button className={styles.confirmBtn} onClick={handleConfirm}>确定筛选</Button>
      </View>
    </View>
  )
}

export default FilterBar
