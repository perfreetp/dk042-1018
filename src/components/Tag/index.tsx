import React from 'react'
import { View } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

type TagType = 'primary' | 'gold' | 'gray' | 'orange' | 'blue'
type TagSize = 'normal' | 'large'

interface TagProps {
  text: string
  type?: TagType
  size?: TagSize
  active?: boolean
  onClick?: () => void
  className?: string
}

const Tag: React.FC<TagProps> = ({
  text,
  type = 'primary',
  size = 'normal',
  active = false,
  onClick,
  className
}) => {
  return (
    <View
      className={classnames(
        styles.tag,
        styles[type],
        size === 'large' && styles.large,
        active && styles.active,
        className
      )}
      onClick={onClick}
    >
      {text}
    </View>
  )
}

export default Tag
