const Wishlist = require("../models/wishlist.js");

module.exports.toggleWishlist = async (req, res) => {
  const listingId = req.params.id;
  const userId = req.user._id;

  const existing = await Wishlist.findOne({
    user: userId,
    listing: listingId,
  });

  if (existing) {
    await Wishlist.deleteOne({ _id: existing._id });
    return res.json({ success: true, action: "removed" });
  } else {
    await Wishlist.create({ user: userId, listing: listingId });
    return res.json({ success: true, action: "added" });
  }
};
