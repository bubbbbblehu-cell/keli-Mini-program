Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    hotel: {
      type: Object,
      value: null,
    },
    hotelAddress: {
      type: String,
      value: '',
    },
    favoriteText: {
      type: String,
      value: '☆ 收藏',
    },
    isFavorite: {
      type: Boolean,
      value: false,
      observer(value) {
        this.setData({
          isFavoriteClass: value ? 'active-favorite' : '',
        });
      },
    },
  },

  data: {
    rating: 5,
    comment: '',
    stars: [
      { value: 1, active: true },
      { value: 2, active: true },
      { value: 3, active: true },
      { value: 4, active: true },
      { value: 5, active: true },
    ],
    isFavoriteClass: '',
  },

  methods: {
    closeSheet() {
      this.triggerEvent('close');
    },

    stopPropagation() {},

    buildStars(rating) {
      return [1, 2, 3, 4, 5].map((value) => ({
        value,
        active: rating >= value,
      }));
    },

    handleStarTap(event) {
      const rating = Number(event.currentTarget.dataset.value || 5);
      this.setData({
        rating,
        stars: this.buildStars(rating),
      });
    },

    handleCommentInput(event) {
      this.setData({ comment: event.detail.value || '' });
    },

    handleToggleFavorite() {
      this.triggerEvent('togglefavorite');
    },

    handleOpenBooking() {
      this.triggerEvent('openbooking');
    },

    submitReview() {
      const comment = (this.data.comment || '').trim();
      if (!comment) {
        wx.showToast({
          title: '请输入评价内容',
          icon: 'none',
        });
        return;
      }

      this.triggerEvent('submitreview', {
        rating: this.data.rating,
        comment,
      });

      this.setData({
        rating: 5,
        comment: '',
        stars: this.buildStars(5),
      });
    },
  },
});
