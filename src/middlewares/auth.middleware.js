import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiErrorHandler } from "../utils/ApiErrorHandler.js"


export const verifyJwtToken = asyncHandler(async function (req, res, next) {
    try {
        const accessToken = req.cookies?.accessToken ||  req?.header("Authorization")?.replace("Bearer ", "") || ''
        
        if (!accessToken) {
            throw new ApiErrorHandler(401, "Unauthorised request")
    }

        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        if (!decodedToken) {
            throw new ApiErrorHandler(401, "Unauthorised request")
        }

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiErrorHandler(401, "Unauthorised user.")
        }


        req.user = user
        next()
    } catch (err) {
        throw new ApiErrorHandler(401, err?.message || "Invaild access Token.")
    }

})