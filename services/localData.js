function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getFavorites() {
  return clone(wx.getStorageSync('favorites') || []);
}

function setFavorites(favorites) {
  wx.setStorageSync('favorites', favorites || []);
}

function toggleFavorite(hotel) {
  const favorites = getFavorites();
  const exists = favorites.some((item) => item.id === hotel.id);
  const nextFavorites = exists
    ? favorites.filter((item) => item.id !== hotel.id)
    : favorites.concat(hotel);

  setFavorites(nextFavorites);

  return {
    favorites: nextFavorites,
    isFavorite: !exists,
  };
}

function getReviews() {
  return clone(wx.getStorageSync('reviews') || []);
}

function addReview(review) {
  const reviews = getReviews();
  reviews.push(review);
  wx.setStorageSync('reviews', reviews);
  return reviews;
}

module.exports = {
  getFavorites,
  setFavorites,
  toggleFavorite,
  getReviews,
  addReview,
};
