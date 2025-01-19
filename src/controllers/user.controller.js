import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiErrorHandler} from "../utils/ApiErrorHandler.js"
import {User} from "../models/user.model.js";
import {uploadFile} from "../utils/cloudinary.js";
import {ApiResponseHandler} from "../utils/ApiResponseHandler.js";

const registerUserController =  asyncHandler(async function(req,res){
    const reqBody = req.body || null
    let coverImageFilePath = ""
    const {fullName,userName,email,password} = reqBody

    if(!reqBody) {
        throw new ApiErrorHandler(400,"Request Body is empty")
    }
        if([fullName,userName,email,password].some((field)=>field.trim() === '')) {
            throw new ApiErrorHandler(400,"All Fields required.")
        }

    const isUserExist = await User.findOne({
        $or:[{email},{userName}]
    })


    if(isUserExist) {
         throw new ApiErrorHandler(400,
            "User Already Exists with this username or email.")
    }

    const avatarFilePath = req.files?.avatar[0]?.path
    if(req.files && Array.isArray(req.files?.coverImage) && req.files?.coverImage[0]?.path ) {
        coverImageFilePath = req.files?.coverImage[0]?.path
    }

    if(!avatarFilePath) {
        throw new ApiErrorHandler(400,"User image required.")
    }

    const avatarImageRes = await uploadFile(avatarFilePath)
    const coverImageRes = coverImageFilePath ? await uploadFile(coverImageFilePath) : null

    if(!avatarImageRes) {
        throw new ApiErrorHandler(400,
            "User image not uploaded successfully.Please Try again")
    }



   const createdUser = await User.create({
        fullName,
        avatar:avatarImageRes.url,
        coverImage:coverImageRes ? coverImageRes.url : "",
        email,
        password,
        userName:userName.toLowerCase()
    })


   const validatedUser = await User.findById(createdUser?._id).select("-password -refreshToken")
   if(!validatedUser) {
    throw new ApiErrorHandler(500,
        "User not created in database.Please try again, after sometime.")
   }

   return res.status(201).json( new ApiResponseHandler(
    200,
    validatedUser,
    "User registered successfully."
   ))
})


export {registerUserController}