const { Schema } = require("mongoose");

const HoldingsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    avg: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for uniqueness: one user can't have duplicate symbols
HoldingsSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = { HoldingsSchema };
