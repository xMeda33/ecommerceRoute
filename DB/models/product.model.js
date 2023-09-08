import mongoose, { Schema, Types, model } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 20,
    },
    description: String,
    images: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    defaultImage: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    availableItems: {
      type: Number,
      required: true,
      min: 1,
    },
    soldItems: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      min: 1,
      required: true,
    },
    discount: {
      type: Number,
      min: 1,
      max: 100,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    brand: {
      type: Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    cloudFolder: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true, strictQuery: true, toJSON: { virtuals: true } }
);

productSchema.virtual("finalPrice").get(function () {
  if (this.price) {
    return Number.parseFloat(
      this.price * ((this.price * this.discount || 0) / 100)
    ).toFixed(2);
  }
});

productSchema.query.paginate = function (page) {
  page = !page || page < 1 || isNaN(page) ? 1 : page;
  const limit = 2;
  const skip = limit * (page - 1);
  return this.skip(skip).limit(limit);
};

productSchema.query.customSelect = function (fields) {
  if (!fields) {
    return this;
  }
  const modelKeys = Object.keys(productModel.schema.paths);
  const queryKeys = fields.split(" ");
  const matchedKeys = queryKeys.filter((key) => modelKeys.includes(key));
  return this.select(matchedKeys);
};

productSchema.methods.inStock = function (requiredQuantity) {
  return this.availableItems >= requiredQuantity ? true : false;
};

export const productModel =
  mongoose.models.productModel || model("Product", productSchema);
