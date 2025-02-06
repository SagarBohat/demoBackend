import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

function getAccessToken(req){
    if(req && req.hasOwnProperty("cookies") && req?.cookies.hasOwnProperty("accessToken")) {
        return req?.cookies?.accessToken || ''
    }else {
        return req.header("Authorization")?.replace("Bearer ","") || ''
    }

}

export const verifyJwtToken = asyncHandler(async function (req,res,next) {
    try {
        const accessToken = getAccessToken()
    
        if(!accessToken) {
            throw new ApiErrorHandler(401, "Unauthorised request")
        }
    
       const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
    
       if(!decodedToken) {
        throw new ApiErrorHandler(401, "Unauthorised request")
       }
    
       const user = await User.findById(decodedToken?._id)
    
       if(!user) {
        throw new ApiErrorHandler(401, "Unauthorised user.")
       }
    
    
       req.user = user
       next()
    } catch (err) {
        throw new ApiErrorHandler(401, err?.message || "Invaild access Token.")
    }

})