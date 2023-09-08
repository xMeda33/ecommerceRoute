import asyncHandler from "../../utils/asyncHandler.js";
import categoryModel from "./../../../DB/models/category.model.js";
import slugify from "slugify";
import cloudinary from "../../utils/cloudinary.js";

export const createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const createdBy = req.user._id;
  if (!req.file) {
    return next(new Error("Category image is required"));
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.FOLDER_CLOUD}/category` }
  );
  const category = await categoryModel.create({
    name,
    createdBy,
    image: { id: public_id, url: secure_url },
    slug: slugify(name),
  });
  return res.status(201).json({ success: true, results: category });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await categoryModel.findById(req.params.categoryId);
  if (!category) {
    return next(new Error("No category with this id"));
  }
  category.name = req.body.name ? req.body.name : category.name;
  category.slug = req.body.name ? slugify(req.body.name) : category.slug;
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: category.image.public_id,
      }
    );
  }
  await category.save()
  return res.status(201).json({success: true})
});

export const deleteCategory = asyncHandler(async (req,res,next)=>{
  const category = await categoryModel.findById(req.params.categoryId)
  if(!category){
    return next(new Error('invalid category'))
  }
  const result = await cloudinary.uploader.destroy(category.image.id)
  await categoryModel.findByIdAndDelete(req.params.categoryId);
  return res.status(201).json({success: 'true'})
})

export const getAllCategory = asyncHandler(async (req,res,next)=>{
  const categories = await categoryModel.find().populate('subCategory')
  return res.status(201).json({success:true, result: categories})
})