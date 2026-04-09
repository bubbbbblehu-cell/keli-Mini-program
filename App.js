App({
  globalData: {
    appName: '女性安全地图小程序',
    theme: {
      text: '#e8eefc',
    },
  },

  onLaunch() {
    const logs = wx.getStorageSync('launchLogs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('launchLogs', logs.slice(0, 20));
  },
});
