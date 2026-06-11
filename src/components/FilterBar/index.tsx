import React, { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import classnames from 'classnames'
import { COLLEGES, COURSES, EDITIONS, CONDITIONS, BOOK_TYPES, BookCondition, BookType, FilterOptions } from '@/types'
import styles from './index.module.scss'

interface FilterBarProps {
  value: FilterOptions
  onChange: (options: FilterOptions) => void
  onConfirm: () => void
}

type FilterKey = 'type' | 'college' | 'course' | 'edition' | 'condition'

const FilterBar: React.FC<FilterBarProps> = ({ value, onChange, onConfirm }) => {
  const [localValue, setLocalValue] = useState<FilterOptions>(value)

  const handleTypeChange = (type: BookType) => {
    setLocalValue({ ...localValue, type: localValue.type === type ? undefined : type })
  }

  const handleTagToggle = (key: Exclude<FilterKey, 'type'>, tagValue: string) => {
    const cur = (localValue as any)[key]
    setLocalValue({ ...localValue, [key]: cur === tagValue ? undefined : tagValue })
  }

  const handleConfirm = () => {
    onChange(localValue)
    onConfirm()
  }

  const handleReset = () => {
    setLocalValue({})
    onChange({})
  }

  const handleResetTag = (key: FilterKey) => {
    const newValue = { ...localValue }
    delete (newValue as any)[key]
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
              onClick={() => handleTagToggle('college', college)}
            >
              {college}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.filterRow}>
        <View className={styles.label}>
          <Text>对应课程</Text>
          {localValue.course && (
            <Text className={styles.resetBtn} onClick={() => handleResetTag('course')}>清除</Text>
          )}
        </View>
        <View className={styles.tagsWrap}>
          {COURSES.map((course) => (
            <View
              key={course}
              className={classnames(styles.tagItem, localValue.course === course && styles.active)}
              onClick={() => handleTagToggle('course', course)}
            >
              {course}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.filterRow}>
        <View className={styles.label}>
          <Text>教材版次</Text>
          {localValue.edition && (
            <Text className={styles.resetBtn} onClick={() => handleResetTag('edition')}>清除</Text>
          )}
        </View>
        <View className={styles.tagsWrap}>
          {EDITIONS.map((edition) => (
            <View
              key={edition}
              className={classnames(styles.tagItem, localValue.edition === edition && styles.active)}
              onClick={() => handleTagToggle('edition', edition)}
            >
              {edition}
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
              onClick={() => handleTagToggle('condition', item.value)}
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
