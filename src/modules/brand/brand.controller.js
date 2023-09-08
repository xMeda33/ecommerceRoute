import asyncHandler from "../../utils/asyncHandler.js";
import brandModel from "./../../../DB/models/brand.model.js";
import slugify from "slugify";
import cloudinary from "../../utils/cloudinary.js";

export const createBrand = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const createdBy = req.user._id;
  if (!req.file) {
    return next(new Error("Brand image is required"));
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.FOLDER_CLOUD}/brand` }
  );
  const brand = await brandModel.create({
    name,
    createdBy,
    image: { id: public_id, url: secure_url },
    slug: slugify(name),
  });
  return res.status(201).json({ success: true, results: brand });
});

export const updateBrand = asyncHandler(async (req, res, next) => {
  const brand = await brandModel.findById(req.params.brandId);
  if (!brand) {
    return next(new Error("No brand with this id"));
  }
  brand.name = req.body.name ? req.body.name : brand.name;
  brand.slug = req.body.name ? slugify(req.body.name) : brand.slug;
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: brand.image.public_id,
      }
    );
  }
  await brand.save()
  return res.status(201).json({success: true})
});

export const deleteBrand = asyncHandler(async (req,res,next)=>{
  const brand = await brandModel.findById(req.params.brandId)
  if(!brand){
    return next(new Error('invalid brand'))
  }
  const result = await cloudinary.uploader.destroy(brand.image.id)
  await brandModel.findByIdAndDelete(req.params.brandId);
  return res.status(201).json({success: 'true'})
})

export const getAllBrand = asyncHandler(async (req,res,next)=>{
  const brands = await brandModel.find()
  return res.status(201).json({success:true, result: brands})
})