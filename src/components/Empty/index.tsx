import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import styles from './index.module.scss'

interface EmptyProps {
  icon?: string
  title?: string
  desc?: string
  actionText?: string
  onAction?: () => void
}

const Empty: React.FC<EmptyProps> = ({
  icon = '📚',
  title = '暂无数据',
  desc,
  actionText,
  onAction
}) => {
  return (
    <View className={styles.wrap}>
      <Text className={styles.icon}>{icon}</Text>
      <Text className={styles.title}>{title}</Text>
      {desc && <Text className={styles.desc}>{desc}</Text>}
      {actionText && (
        <Button className={styles.actionBtn} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </View>
  )
}

export default Empty
