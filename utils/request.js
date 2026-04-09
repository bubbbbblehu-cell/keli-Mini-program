const { SUPABASE_URL, SUPABASE_ANON_KEY } = require('../config/env');

function request({ path, method = 'GET', data }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${SUPABASE_URL}/rest/v1/${path}`,
      method,
      data,
      header: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }

        const message = res.data && res.data.message ? res.data.message : '请求失败';
        reject(new Error(message));
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
}

module.exports = {
  request,
};
