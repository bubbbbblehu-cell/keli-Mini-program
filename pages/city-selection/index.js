const storage = require('../../utils/storage');
const {
  getCities,
  transformCitiesData,
  groupCitiesByCountry,
} = require('../../services/hotelService');

Page({
  data: {
    loading: true,
    cities: [],
    countries: [],
  },

  onLoad() {
    this.loadCities();
  },

  async loadCities() {
    this.setData({ loading: true });

    try {
      const dbCities = await getCities();
      const cities = transformCitiesData(dbCities);
      const grouped = groupCitiesByCountry(cities);
      const countries = Object.keys(grouped).map((country) => ({
        country,
        cities: grouped[country],
      }));

      this.setData({
        loading: false,
        cities,
        countries,
      });
    } catch (error) {
      this.setData({ loading: false });
      wx.showModal({
        title: '加载失败',
        content: `无法加载城市列表：${error.message || '请稍后重试'}`,
        confirmText: '重试',
        success: (res) => {
          if (res.confirm) {
            this.loadCities();
          }
        },
      });
    }
  },

  handleCityTap(event) {
    const city = event.currentTarget.dataset.city;
    if (!city) return;

    storage.set('hasLaunched', true);
    storage.set('selectedCity', city);
    wx.redirectTo({
      url: `/pages/map/index?cityId=${city.id}`,
    });
  },
});
