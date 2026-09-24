const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const Wishlist = require("../models/wishlist.js");
const wishlistController = require("../controllers/wishlist.js");

const { isLoggedIn } = require("../middleware");

router.post("/:id", isLoggedIn, wrapAsync(wishlistController.toggleWishlist));

module.exports = router;
