const mongoose = require('mongoose');

const tourScheSchema = new mongoose.Schema(
  {
    tour_sche_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    tour_sche_name: {
      type: String,
      required: true,
      trim: true
    },
    tour_sche_desc: {
      type: String,
      default: ''
    },
    time_sche_start: {
      type: String,
      required: true
    },
    time_sche_end: {
      type: String,
      default: ''
    },
    tour_sche_add: {
      type: String,
      default: ''
    },
    tour_sche_longit: {
      type: Number,
      default: null
    },
    tour_sche_latit: {
      type: Number,
      default: null
    },
    day_number: {
      type: Number,
      required: true
    },
    tour_times_id: {
      type: String,
      required: true,
      ref: 'tour_times'
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

module.exports = mongoose.model('tour_sches', tourScheSchema);
