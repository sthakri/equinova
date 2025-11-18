const { Schema } = require("mongoose");

const OrdersSchema = new Schema(
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
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mode: {
      type: String,
      required: true,
      uppercase: true,
      enum: ["BUY", "SELL"],
    },
  },
  {
    timestamps: true,
  }
);

// Index on userId for faster user-specific queries
OrdersSchema.index({ userId: 1, createdAt: -1 });

module.exports = { OrdersSchema };
