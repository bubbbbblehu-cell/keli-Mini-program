const storage = require('../../utils/storage');
const {
  getCities,
  getHotelsByCityId,
  transformCitiesData,
  transformHotelsData,
  generateHeatmapData,
  groupCitiesByCountry,
} = require('../../services/hotelService');
const { getFavorites, toggleFavorite, addReview } = require('../../services/localData');
const { buildMarkers, buildCircles, getMapScale } = require('../../utils/hotel');

Page({
  data: {
    loading: true,
    city: null,
    cities: [],
    groupedCities: [],
    hotels: [],
    filteredHotels: [],
    markers: [],
    circles: [],
    favorites: [],
    selectedHotel: null,
    selectedHotelId: '',
    selectedHotelIsFavorite: false,
    showHeatmap: true,
    minRating: 0,
    filterInput: '0',
    showCitySheet: false,
    showFilterSheet: false,
    totalHotels: 0,
    displayedHotels: 0,
    latitude: 31.2304,
    longitude: 121.4737,
    scale: 12,
  },

  onLoad(options) {
    this.cityId = options.cityId || '';
    this.bootstrap();
  },

  onShow() {
    this.setData({
      favorites: getFavorites(),
    });
  },

  async bootstrap() {
    this.setData({ loading: true });
    try {
      const dbCities = await getCities();
      const cities = transformCitiesData(dbCities);
      const grouped = groupCitiesByCountry(cities);
      const groupedCities = Object.keys(grouped).map((country) => ({
        country,
        cities: grouped[country],
      }));

      let city = cities.find((item) => item.id === this.cityId);
      if (!city) {
        const cachedCity = storage.get('selectedCity', null);
        if (cachedCity && cachedCity.id) {
          city = cachedCity;
        }
      }
      if (!city && cities.length) {
        city = cities[0];
      }
      if (!city) {
        throw new Error('暂无可用城市');
      }

      storage.set('selectedCity', city);
      this.setData({
        city,
        cities,
        groupedCities,
        favorites: getFavorites(),
        latitude: city.latitude,
        longitude: city.longitude,
        scale: getMapScale(city.zoomLevel),
      });

      await this.loadHotels(city);
    } catch (error) {
      this.setData({ loading: false });
      wx.showModal({
        title: '地图初始化失败',
        content: error.message || '请稍后重试',
        confirmText: '返回',
        success: () => {
          wx.redirectTo({ url: '/pages/city-selection/index' });
        },
      });
    }
  },

  async loadHotels(city) {
    this.setData({ loading: true, selectedHotel: null, selectedHotelId: '' });

    try {
      const dbHotels = await getHotelsByCityId(city.id);
      const hotels = transformHotelsData(dbHotels);
      this.setData({ hotels, loading: false });
      this.applyFilters();
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({
        title: error.message || '加载酒店失败',
        icon: 'none',
      });
    }
  },

  applyFilters() {
    const minRating = Number(this.data.minRating || 0);
    const filteredHotels = (this.data.hotels || []).filter((hotel) => Number(hotel.safetyScore || 0) >= minRating);
    const heatmapData = generateHeatmapData(filteredHotels);

    this.setData({
      filteredHotels,
      markers: buildMarkers(filteredHotels),
      circles: buildCircles(heatmapData, this.data.showHeatmap),
      totalHotels: this.data.hotels.length,
      displayedHotels: filteredHotels.length,
    });
  },

  handleMarkerTap(event) {
    const markerId = Number(event.detail.markerId);
    const hotel = (this.data.filteredHotels || [])[markerId - 1];
    if (!hotel) return;

    this.setData({
      selectedHotel: hotel,
      selectedHotelId: hotel.id,
      selectedHotelIsFavorite: this.data.favorites.some((item) => item.id === hotel.id),
    });
  },

  closeHotelSheet() {
    this.setData({
      selectedHotel: null,
      selectedHotelId: '',
      selectedHotelIsFavorite: false,
    });
  },

  toggleHeatmap() {
    this.setData({
      showHeatmap: !this.data.showHeatmap,
    }, () => this.applyFilters());
  },

  openFilterSheet() {
    this.setData({
      showFilterSheet: true,
      filterInput: String(this.data.minRating || 0),
    });
  },

  closeFilterSheet() {
    this.setData({ showFilterSheet: false });
  },

  onFilterInput(event) {
    this.setData({ filterInput: event.detail.value || '0' });
  },

  applyFilterValue() {
    const minRating = Number(this.data.filterInput || 0);
    this.setData({
      minRating: Number.isNaN(minRating) ? 0 : minRating,
      showFilterSheet: false,
    }, () => this.applyFilters());
  },

  clearFilter() {
    this.setData({
      minRating: 0,
      filterInput: '0',
      showFilterSheet: false,
    }, () => this.applyFilters());
  },

  openCitySheet() {
    this.setData({ showCitySheet: true });
  },

  closeCitySheet() {
    this.setData({ showCitySheet: false });
  },

  async selectCity(event) {
    const city = event.currentTarget.dataset.city;
    if (!city) return;

    storage.set('selectedCity', city);
    this.cityId = city.id;
    this.setData({
      city,
      latitude: city.latitude,
      longitude: city.longitude,
      scale: getMapScale(city.zoomLevel),
      showCitySheet: false,
    });

    await this.loadHotels(city);
  },

  handleToggleFavorite() {
    const hotel = this.data.selectedHotel;
    if (!hotel) return;

    const result = toggleFavorite(hotel);
    this.setData({
      favorites: result.favorites,
      selectedHotelIsFavorite: result.isFavorite,
    });

    wx.showToast({
      title: result.isFavorite ? '已加入收藏' : '已取消收藏',
      icon: 'none',
    });
  },

  handleSubmitReview(event) {
    const hotel = this.data.selectedHotel;
    if (!hotel) return;

    const detail = event.detail || {};
    const review = {
      hotelId: hotel.id,
      rating: Number(detail.rating || 5),
      comment: detail.comment || '',
      date: new Date().toISOString(),
    };

    addReview(review);

    const hotels = (this.data.hotels || []).map((item) => {
      if (item.id !== hotel.id) {
        return item;
      }

      const currentCount = Number(item.reviewCount || 0);
      const currentScore = Number(item.safetyScore || 0);
      const nextCount = currentCount + 1;
      const nextScore = ((currentScore * currentCount) + review.rating) / nextCount;

      return {
        ...item,
        reviewCount: nextCount,
        safetyScore: Number(nextScore.toFixed(1)),
      };
    });

    const nextSelectedHotel = hotels.find((item) => item.id === hotel.id) || hotel;

    this.setData({
      hotels,
      selectedHotel: nextSelectedHotel,
      selectedHotelIsFavorite: this.data.favorites.some((item) => item.id === hotel.id),
    }, () => this.applyFilters());

    wx.showToast({
      title: '评价已保存',
      icon: 'success',
    });
  },

  noop() {},

  handleOpenBooking() {
    const hotel = this.data.selectedHotel;
    if (!hotel) return;

    const bookingUrl = hotel.bookingUrl || '';
    if (!bookingUrl) {
      wx.showToast({
        title: '暂无订房链接',
        icon: 'none',
      });
      return;
    }

    wx.setClipboardData({
      data: bookingUrl,
      success: () => {
        wx.showModal({
          title: '链接已复制',
          content: '小程序无法直接打开外部订房网站，已帮你复制链接，可粘贴到浏览器打开。',
          showCancel: false,
        });
      },
    });
  },

  goBackToCities() {
    wx.redirectTo({ url: '/pages/city-selection/index' });
  },
});
