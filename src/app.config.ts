export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/chat/index',
    'pages/order/index',
    'pages/profile/index',
    'pages/detail/index',
    'pages/publish/index',
    'pages/search/index',
    'pages/chat-detail/index',
    'pages/shelf/index',
    'pages/favorites/index',
    'pages/history/index',
    'pages/price-alert/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#22C55E',
    navigationBarTitleText: '校园书易',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F8FAF5'
  },
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#22C55E',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/chat/index',
        text: '聊天'
      },
      {
        pagePath: 'pages/order/index',
        text: '订单'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
