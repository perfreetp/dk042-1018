import React, { useState } from 'react'
import { View, Text, Input, Textarea, Button, Image, Switch } from '@tarojs/components'
import Taro from '@tarojs/taro'
import useAppStore from '@/store/useAppStore'
import { COLLEGES, CONDITIONS, BOOK_TYPES, BookType, BookCondition, Book } from '@/types'
import classnames from 'classnames'
import styles from './index.module.scss'

const PublishPage: React.FC = () => {
  const { currentUser, addBook } = useAppStore()
  const [type, setType] = useState<BookType>('sell')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [publisher, setPublisher] = useState('')
  const [isbn, setIsbn] = useState('')
  const [edition, setEdition] = useState('')
  const [college, setCollege] = useState('')
  const [course, setCourse] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [condition, setCondition] = useState<BookCondition>('good')
  const [hasNotes, setHasNotes] = useState(false)
  const [negotiable, setNegotiable] = useState(true)
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>(['图书馆门口'])

  const handleScanIsbn = () => {
    Taro.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode'],
      success: (res) => {
        setIsbn(res.result)
        Taro.showToast({ title: 'ISBN识别成功', icon: 'success' })
        console.log('[Publish] ISBN扫描结果:', res.result)
      },
      fail: (err) => {
        console.error('[Publish] ISBN扫描失败:', err)
        Taro.showToast({ title: '扫码取消', icon: 'none' })
      }
    })
  }

  const handleUploadImg = () => {
    Taro.chooseImage({
      count: 6 - images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImgs = res.tempFilePaths.slice(0, 6 - images.length)
        setImages([...images, ...newImgs])
        console.log('[Publish] 上传图片:', newImgs.length, '张')
      },
      fail: (err) => {
        console.error('[Publish] 图片上传失败:', err)
      }
    })
  }

  const handleRemoveImg = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx))
  }

  const handleAddLocation = () => {
    Taro.showActionSheet({
      itemList: ['图书馆门口', '南区食堂', '北区食堂', '西门咖啡厅', '宿舍楼下', '自定义地点'],
      success: (res) => {
        if (res.tapIndex === 5) {
          Taro.showModal({
            title: '添加取书地点',
            editable: true,
            placeholderText: '请输入校内取书地点',
            success: (r) => {
              if (r.confirm && r.content && !locations.includes(r.content)) {
                setLocations([...locations, r.content])
              }
            }
          })
        } else {
          const locs = ['图书馆门口', '南区食堂', '北区食堂', '西门咖啡厅', '宿舍楼下']
          const loc = locs[res.tapIndex]
          if (!locations.includes(loc)) {
            setLocations([...locations, loc])
          }
        }
      }
    })
  }

  const handleRemoveLocation = (loc: string) => {
    setLocations(locations.filter(l => l !== loc))
  }

  const validate = () => {
    if (!title.trim()) { Taro.showToast({ title: '请输入书名', icon: 'none' }); return false }
    if (!author.trim()) { Taro.showToast({ title: '请输入作者', icon: 'none' }); return false }
    if (type !== 'buy' && images.length === 0) { Taro.showToast({ title: '请至少上传一张图片', icon: 'none' }); return false }
    if (type !== 'exchange' && type !== 'buy' && !price) { Taro.showToast({ title: '请输入价格', icon: 'none' }); return false }
    if (type !== 'buy' && !college) { Taro.showToast({ title: '请选择学院', icon: 'none' }); return false }
    return true
  }

  const handleSubmit = () => {
    if (!validate()) return

    const newBook: Book = {
      id: 'b' + Date.now(),
      title: title.trim(),
      author: author.trim(),
      publisher: publisher.trim() || '未知出版社',
      isbn: isbn.trim() || '0000000000000',
      edition: edition.trim() || '第1版',
      college: college || currentUser.college,
      course: course.trim() || '通用课程',
      price: type === 'exchange' ? 0 : Number(price) || 0,
      originalPrice: Number(originalPrice) || 0,
      condition,
      type,
      hasNotes,
      negotiable,
      description: description.trim() || '书况良好，欢迎咨询~',
      images: images.map((url, idx) => ({ id: 'img' + idx, url: url.startsWith('http') ? url : 'https://picsum.photos/id/' + (119 + idx) + '/600/600' })),
      seller: currentUser,
      pickupLocations: locations.length > 0 ? locations : ['图书馆门口'],
      createdAt: new Date().toLocaleString('zh-CN').slice(0, 16).replace(/\//g, '-'),
      viewCount: 0,
      favoriteCount: 0
    }

    addBook(newBook)
    Taro.showModal({
      title: '发布成功！',
      content: '您的教材已成功发布，快去查看吧~',
      confirmText: '去看看',
      cancelText: '继续发布',
      success: (res) => {
        if (res.confirm) {
          Taro.switchTab({ url: '/pages/home/index' })
        } else {
          setTitle(''); setAuthor(''); setPrice(''); setImages([])
          setDescription('')
        }
      }
    })
    console.log('[Publish] 发布成功:', newBook.title)
  }

  const handleSaveDraft = () => {
    Taro.showToast({ title: '已保存到草稿箱', icon: 'success' })
  }

  const getUploadUrl = (url: string, idx: number) => {
    if (url.startsWith('http')) return url
    return 'https://picsum.photos/id/' + (200 + idx) + '/600/600'
  }

  return (
    <View className={styles.page}>
      <View className={styles.typeTabs}>
        {BOOK_TYPES.map(t => (
          <View
            key={t.value}
            className={classnames(styles.typeTab, type === t.value && styles.active)}
            onClick={() => setType(t.value)}
          >
            <Text className={styles.typeTabIcon}>
              {t.value === 'sell' ? '📚' : t.value === 'buy' ? '🛒' : '🔄'}
            </Text>
            {t.label}
          </View>
        ))}
      </View>

      <View className={styles.form}>
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📖</Text>
            <Text className={styles.sectionTitleText}>基本信息</Text>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}><Text className={styles.required}>*</Text>书名</Text>
            <Input
              className={styles.input}
              placeholder="请输入教材名称"
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}><Text className={styles.required}>*</Text>作者</Text>
            <Input
              className={styles.input}
              placeholder="请输入作者姓名"
              value={author}
              onInput={(e) => setAuthor(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>出版社</Text>
            <Input
              className={styles.input}
              placeholder="选填，如：清华大学出版社"
              value={publisher}
              onInput={(e) => setPublisher(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>ISBN编号</Text>
            <View className={styles.inputRow}>
              <Input
                className={styles.input}
                placeholder="可扫描条形码自动录入"
                value={isbn}
                onInput={(e) => setIsbn(e.detail.value)}
              />
              <Button className={styles.isbnBtn} onClick={handleScanIsbn}>
                📷 扫码
              </Button>
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>版次</Text>
            <Input
              className={styles.input}
              placeholder="如：第7版"
              value={edition}
              onInput={(e) => setEdition(e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>🎓</Text>
            <Text className={styles.sectionTitleText}>课程信息</Text>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>所属学院</Text>
            <View className={styles.optionRow}>
              {COLLEGES.slice(0, 8).map(c => (
                <View
                  key={c}
                  className={classnames(styles.optionItem, college === c && styles.active)}
                  onClick={() => setCollege(college === c ? '' : c)}
                >
                  {c.slice(0, 4)}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>课程名称</Text>
            <Input
              className={styles.input}
              placeholder="如：数据结构"
              value={course}
              onInput={(e) => setCourse(e.detail.value)}
            />
          </View>
        </View>

        {type !== 'buy' && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📷</Text>
              <Text className={styles.sectionTitleText}>实拍图片</Text>
            </View>
            <View className={styles.uploadWrap}>
              {images.map((img, idx) => (
                <View key={idx} className={styles.uploadItem} style={{ border: 'none' }}>
                  <Image
                    className={styles.uploadImg}
                    src={getUploadUrl(img, idx)}
                    mode="aspectFill"
                  />
                  <View className={styles.uploadRemove} onClick={() => handleRemoveImg(idx)}>×</View>
                </View>
              ))}
              {images.length < 6 && (
                <View className={styles.uploadItem} onClick={handleUploadImg}>
                  <View className={styles.uploadAdd}>
                    <Text className={styles.uploadAddIcon}>+</Text>
                    <Text className={styles.uploadAddText}>{images.length}/6</Text>
                  </View>
                </View>
              )}
            </View>
            <Text className={styles.hint}>💡 建议上传封面、内页、版权页等实拍图，有笔记的地方拍照展示更容易卖出哦~</Text>
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>💰</Text>
            <Text className={styles.sectionTitleText}>交易信息</Text>
          </View>

          {type !== 'exchange' && (
            <View className={styles.formItem}>
              <Text className={styles.label}>
                {type === 'sell' ? '出售价格' : '求购预算'}
                {type !== 'buy' && <Text className={styles.required}>*</Text>}
              </Text>
              <View className={styles.inputRow}>
                <Text style={{ fontSize: '36rpx', color: '#EA580C', fontWeight: 'bold' }}>¥</Text>
                <Input
                  className={styles.input}
                  type="digit"
                  placeholder={type === 'sell' ? '请输入售价' : '选填，可输入预算范围'}
                  value={price}
                  onInput={(e) => setPrice(e.detail.value)}
                />
              </View>
            </View>
          )}

          {type === 'sell' && (
            <View className={styles.formItem}>
              <Text className={styles.label}>原价</Text>
              <View className={styles.inputRow}>
                <Text style={{ fontSize: '28rpx', color: '#9CA3AF' }}>¥</Text>
                <Input
                  className={styles.input}
                  type="digit"
                  placeholder="选填，便于买家了解折扣"
                  value={originalPrice}
                  onInput={(e) => setOriginalPrice(e.detail.value)}
                />
              </View>
            </View>
          )}

          <View className={styles.formItem}>
            <Text className={styles.label}>{type === 'buy' ? '期望成色' : '书籍成色'}</Text>
            <View className={styles.optionRow}>
              {CONDITIONS.map(c => (
                <View
                  key={c.value}
                  className={classnames(styles.optionItem, condition === c.value && styles.active)}
                  onClick={() => setCondition(c.value)}
                >
                  {c.label}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.switchRow}>
            <View>
              <View className={styles.switchLabel}>📝 是否有笔记/划线</View>
              <Text className={styles.switchDesc}>{type === 'sell' ? '勾选可让需要笔记的同学优先选择' : '勾选表示你希望有笔记的书'}</Text>
            </View>
            <Switch checked={hasNotes} onChange={(e) => setHasNotes(e.detail.value)} color="#22C55E" />
          </View>

          <View className={styles.switchRow}>
            <View>
              <View className={styles.switchLabel}>🤝 接受议价</View>
              <Text className={styles.switchDesc}>价格可适当商量</Text>
            </View>
            <Switch checked={negotiable} onChange={(e) => setNegotiable(e.detail.value)} color="#22C55E" />
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📍</Text>
            <Text className={styles.sectionTitleText}>校内取书地点</Text>
          </View>
          <View className={styles.locationInput}>
            {locations.map(loc => (
              <View key={loc} className={styles.locationTag}>
                <Text>📍</Text>
                <Text>{loc}</Text>
                <Text className={styles.locationRemove} onClick={() => handleRemoveLocation(loc)}>×</Text>
              </View>
            ))}
            {locations.length < 5 && (
              <View className={styles.locationAdd} onClick={handleAddLocation}>
                + 添加地点
              </View>
            )}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>✏️</Text>
            <Text className={styles.sectionTitleText}>详细描述</Text>
          </View>
          <View className={styles.formItem} style={{ borderBottom: 'none' }}>
            <Textarea
              className={styles.textarea}
              placeholder={type === 'sell'
                ? '介绍一下书籍情况：使用时长、笔记情况、瑕疵说明等，越详细越容易卖出哦~'
                : type === 'buy'
                  ? '描述你想要的书：成色要求、是否需要笔记、预算范围等~'
                  : '描述你有的书和想换的书，越详细越容易配对成功哦~'}
              maxlength={500}
              value={description}
              onInput={(e) => setDescription(e.detail.value)}
            />
            <Text style={{ textAlign: 'right', fontSize: '22rpx', color: '#9CA3AF' }}>
              {description.length}/500
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.draftBtn} onClick={handleSaveDraft}>
          存草稿
        </Button>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          🚀 立即发布
        </Button>
      </View>
    </View>
  )
}

export default PublishPage
