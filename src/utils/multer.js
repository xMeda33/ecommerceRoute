import multer, {diskStorage} from 'multer'
export const filterObject = {
    image: ['image/png', 'image/jpg'],
    pdf: ['application/pdf'],
    video: ['video/mp4']
}
export const fileUpload = (filterArr)=>{
    const fileFilter = (req,file,cb)=>{
        if(!filterArr.includes(file.mimetype)){
            return cb(new Error('invalid file format'), false)
        }
        return cb(null, true)
    }
    return multer({storage: diskStorage({}), fileFilter})
}