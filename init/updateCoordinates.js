const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("../models/listing.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

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

async function updateAll() {
  await mongoose.connect(MONGO_URL);
  const listings = await Listing.find({
    "geometry.coordinates": { $exists: false },
  });
  console.log(`Found ${listings.length} listings to update`);

  for (let listing of listings) {
    const coordinates = await getCoordinates(listing.location, listing.country);
    listing.geometry = { type: "Point", coordinates };
    await listing.save();
    console.log(`Updated: ${listing.title} → ${coordinates}`);
    // delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("Done!");
  mongoose.connection.close();
}

updateAll();
