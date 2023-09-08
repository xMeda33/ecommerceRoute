import slugify from "slugify";
import categoryModel from "../../../DB/models/category.model.js";
import { subCategoryModel } from "../../../DB/models/subcategory.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloudinary.js";

export const createSubCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { categoryId } = req.params;
  const category = await categoryModel.findById(categoryId);
  if (!category) {
    return next(new Error("Please enter valid category id", { cause: 400 }));
  }
  if (!req.file) {
    return next(new Error("Image is required", { cause: 404 }));
  }
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.FOLDER_CLOUD}/subcategory`,
    }
  );
  const subcategory = await subCategoryModel.create({
    name,
    slug: slugify(name),
    createdBy: req.user._id,
    image: { id: public_id, url: secure_url },
    category: categoryId,
  });
  return res.status(201).json({ success: "true", result: subcategory });
});

export const updateSubCategory = asyncHandler(async (req, res, next) => {
  const category = await categoryModel.findById(req.params.categoryId);
  if (!category) {
    return next(new Error("Invalid category id"));
  }
  const subCategory = await subCategoryModel.findOne({
    _id: req.params.subcategoryId,
    categoryId: req.params.categoryId,
  });
  if (!subCategory) {
    return next(new Error("invalid subcategory id"));
  }
  subCategory.name = req.body.name ? req.body.name : subCategory.name;
  subCategory.slug = req.body.name ? slugify(req.body.name) : subCategory.slug;
  if (req.file) {
    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      public_id: subCategory.image.id,
    });
    subCategory.image.url = secure_url;
  }
  await subCategory.save();
  return res.status(201).json({ success: true, result: subCategory });
});

export const deleteSubCategory = asyncHandler(async (req, res, next) => {
  const category = await categoryModel.findOneAndDelete({
    _id: req.params.categoryId,
    categoryId: req.params.categoryId,
  });
  if (!category) {
    return next(new Error("Invalid category id"));
  }
  const subCategory = await subCategoryModel.findByIdAndDelete(
    req.params.subcategoryId
  );
  if (!subCategory) {
    return next(new Error("invalid subcategory id"));
  }
  return res.status(201).json({ success: true });
});

export const getAllSubCategories = asyncHandler(async (req, res, next) => {
  const subCategory = await subCategoryModel.find();
  return res.json({ success: true, result: subCategory });
});
