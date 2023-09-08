import asyncHandler from './../utils/asyncHandler.js'
import tokenModel from './../../DB/models/token.model.js'
import userModel from './../../DB/models/user.model.js'
import jwt from 'jsonwebtoken'
export const isAuth = asyncHandler(async (req,res,next)=>{
    let token = req.headers.token
    if(!token ){
        return next(new Error('valid token is required', {cause: 400}))
    }
    token = token.split(process.env.BEARER)[1]
    const decoded = jwt.verify(token, process.env.TOKEN_KEY)
    if(!decoded){
        return next(new Error('something went wrong'))
    }
    const tokenDB =  await tokenModel.findOne({token, isValid: true})
    if(!tokenDB){
        return next(new Error('token expired'))
    }
    const user = await userModel.findOne({email: decoded.email})
    if(!user){
        return next(new Error('user email not found'))
    }
    req.user = user
    return next()
})