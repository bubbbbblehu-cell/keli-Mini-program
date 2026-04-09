function get(key, fallback = null) {
  try {
    const value = wx.getStorageSync(key);
    return value === '' || typeof value === 'undefined' ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function set(key, value) {
  wx.setStorageSync(key, value);
}

module.exports = {
  get,
  set,
};
