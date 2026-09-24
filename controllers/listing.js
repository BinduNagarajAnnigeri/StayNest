const Listing = require("../models/listing");
const axios = require("axios");
const User = require("../models/user.js");

const Wishlist = require("../models/wishlist");

module.exports.index = async (req, res) => {
  let listingCategory = req.query.category;
  let search = req.query.search;

  if (listingCategory) {
    const allListings = await Listing.find({ category: listingCategory });
    return res.render("listings/index.ejs", { allListings });
  }

  if (search) {
    const allListings = await Listing.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ],
    });
    return res.render("listings/index.ejs", { allListings });
  }

  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

async function getCoordinates(location, country) {
  try {
    const query = `${location}, ${country}`;
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: { q: query, format: "json", limit: 1 },
        headers: { "User-Agent": "WanderLust/1.0" },
      },
    );
    if (response.data.length > 0) {
      const { lon, lat } = response.data[0];
      return [parseFloat(lon), parseFloat(lat)];
    }
    return [0, 0];
  } catch {
    return [0, 0];
  }
}

module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let wishlistSet = new Set();

  if (req.user) {
    const wishlist = await Wishlist.find({ user: req.user._id });

    wishlistSet = new Set(wishlist.map((item) => item.listing.toString()));
  }

  res.render("listings/show.ejs", {
    listing,
    wishlistSet,
  });
};

module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  // geocode
  const coordinates = await getCoordinates(
    newListing.location,
    newListing.country,
  );
  // console.log("location:", newListing.location, newListing.country);
  // console.log("coordinates:", coordinates);
  newListing.geometry = { type: "Point", coordinates };

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace(
    "/upload",
    "/upload/w_300,h_200,c_fill",
  );
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }

  // re-geocode in case location changed
  const coordinates = await getCoordinates(
    req.body.listing.location,
    req.body.listing.country,
  );
  listing.geometry = { type: "Point", coordinates };

  await listing.save();

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deleted = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
