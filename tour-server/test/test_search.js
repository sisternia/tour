require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const { retrieveRelevantTours } = require('./src/services/rag.service');

const runTest = async () => {
  await connectDB();
  try {
    console.log("Testing vector search for 'Hàn Quốc'...");
    const results = await retrieveRelevantTours("Có chuyến đi nào ở Hàn Quốc không", 3);
    console.log("Search results:", JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("Test failed with error:", err);
  } finally {
    mongoose.connection.close();
  }
};

runTest();
