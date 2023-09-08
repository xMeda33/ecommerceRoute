import asyncHandler from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloudinary.js";
import { nanoid } from "nanoid";
import { productModel } from "./../../../DB/models/product.model.js";
import categoryModel from "./../../../DB/models/category.model.js";
import { subCategoryModel } from "./../../../DB/models/subcategory.model.js";

export const createProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    price,
    category,
    availableItems,
    subCategory,
    brand,
    discount,
  } = req.body;
  const categoryFind = await categoryModel.findById(category);
  if (!categoryFind) {
    return next(new Error("category not found"));
  }
  const brandFind = await brandModel.findById(brand);
  if (!brandFind) {
    return next(new Error("brand not found"));
  }
  const subCategoryFind = await subCategoryModel.findById(subCategory);
  if (!subCategoryFind) {
    return next(new Error("subcategory not found"));
  }
  if (!req.files) {
    return next(new Error("Product images are required", { cause: 400 }));
  }
  const cloudFolder = nanoid();
  let images = [];
  for (const file of req.files.images) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.FOLDER_CLOUD}/products/${cloudFolder}`,
      }
    );
    images.push({ id: public_id, url: secure_url });
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.defaultImage[0].path,
    {
      folder: `${process.env.FOLDER_CLOUD}/products/${cloudFolder}`,
    }
  );
  const product = await productModel.create({
    ...req.body,
    cloudFolder,
    createdBy: req.user._id,
    defaultImage: { url: secure_url, id: public_id },
    images,
  });
  return res.status(201).json({ success: true, result: product });
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await productModel.findById(req.params.productId);
  if (!product) {
    return next(new Error("product not found"));
  }
  if (req.user._id.toString() != product.createdBy.toString()) {
    return next(new Error("you are not authorized to delete this product"));
  }
  const imagesArr = product.images;
  const ids = imagesArr.map((image) => image.id);
  ids.push(product.defaultImage.id);
  await cloudinary.api.delete_resources(ids);
  await cloudinary.api.delete_folder(
    `${process.env.FOLDER_CLOUD}/products/${product.cloudFolder}`
  );
  await productModel.findByIdAndDelete(req.params.productId);
  return res.json({ success: true });
});

export const getAllProducts = asyncHandler(async (req, res, next) => {
  // const { s } = req.query;
  // const products = await productModel.find({
  //   $or: [
  //     { name: { $regex: s, $options: "i" } },
  //     { description: { $regex: s, $options: "i" } },
  //   ],
  // });
  // const {name, price} = req.query
  // const products = await productModel.find()
  //------------pagination---------
  // let { page } = req.query;
  // page = !page || page < 1 || isNaN(page) ? 1 : page;
  // const limit = 2;
  // const skip = limit * (page - 1);
  // const products = await productModel.find().skip(skip).limit(limit);
  //-----------sorting--------------
  if (req.params.categoryId) {
    const category = await categoryModel.findById(req.params.categoryId);
    if(!category){
      return next(new Error('Invalid category id'))
    }
    const products = await productModel.find({
      category: req.params.categoryId,
    });
    if (!products) {
      return next(new Error("No products with this category id"));
    }
    return res.json({ success: true, result: products });
  }
  const products = await productModel
    .find({ ...req.query })
    .paginate(req.query.page)
    .customSelect(req.query.fields)
    .sort(req.query.sort);
  res.json({ success: true, result: products });
});

export const getSingleProduct = asyncHandler(async (req, res, next) => {
  const product = await productModel.findById(req.params.productId);
  if (!product) {
    return next(new Error("product not found"));
  }
  return res.json({ success: true, result: product });
});

export const getProductsCategory = asyncHandler(async (req, res, next) => {});
