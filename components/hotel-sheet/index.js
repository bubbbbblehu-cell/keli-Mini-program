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
    isFavorite: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    rating: 5,
    comment: '',
    stars: [1, 2, 3, 4, 5],
  },

  methods: {
    closeSheet() {
      this.triggerEvent('close');
    },

    stopPropagation() {},

    handleStarTap(event) {
      const rating = Number(event.currentTarget.dataset.value || 5);
      this.setData({ rating });
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
      });
    },
  },
});
