const mongoose = require('mongoose');

const tourTimeSchema = new mongoose.Schema(
  {
    tour_times_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    tour_duration: {
      type: Number,
      required: true
    },
    date_start: {
      type: Date,
      required: true
    },
    date_end: {
      type: Date,
      required: true
    },
    tour_id: {
      type: String,
      required: true,
      ref: 'tours'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('tour_times', tourTimeSchema);
