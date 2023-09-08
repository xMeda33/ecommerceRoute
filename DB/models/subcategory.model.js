import mongoose, { Schema, Types, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    image: {
      id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    createdBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
      brand: {
        type: Types.ObjectId,
        ref: 'Brand'
      }
  },
  { timestamps: true }
);

export const subCategoryModel = mongoose.models.Subcategory || model('Subcategory', subCategorySchema)