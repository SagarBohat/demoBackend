import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrorHandler } from "../utils/ApiErrorHandler.js"
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/cloudinary.js";
import { ApiResponseHandler } from "../utils/ApiResponseHandler.js";
import jwt from "jsonwebtoken";

async function generateAccessAndRefreshToken(userId) {
    try {
        if (userId) {
            console.debug(userId, 'user id ')
            const user = await User.findById(userId)
            const accessToken = await user.generateAccessToken()
            const refreshToken = await user.generateRefreshToken()
            if (accessToken || refreshToken) {
                user.refreshToken = refreshToken
                await user.save({ validateBeforeSave: false })

                return { accessToken, refreshToken }
            } else {
                return { accessToken: '', refreshToken: '' }
            }

        }
    } catch (err) {
        throw new ApiErrorHandler(500, "Erorr in generating access and refresh token." + err?.message)
    }
}

const registerUserController = asyncHandler(async function (req, res) {
    const reqBody = req.body || null
    let coverImageFilePath = ""
    const { fullName, userName, email, password } = reqBody

    if (!reqBody) {
        throw new ApiErrorHandler(400, "Request Body is empty")
    }
    if ([fullName, userName, email, password].some((field) => field.trim() === '')) {
        throw new ApiErrorHandler(400, "All Fields required.")
    }

    const isUserExist = await User.findOne({
        $or: [{ email }, { userName }]
    })


    if (isUserExist) {
        throw new ApiErrorHandler(400,
            "User Already Exists with this username or email.")
    }

    const avatarFilePath = req.files?.avatar[0]?.path
    if (req.files && Array.isArray(req.files?.coverImage) && req.files?.coverImage[0]?.path) {
        coverImageFilePath = req.files?.coverImage[0]?.path
    }

    if (!avatarFilePath) {
        throw new ApiErrorHandler(400, "User image required.")
    }

    const avatarImageRes = await uploadFile(avatarFilePath)
    const coverImageRes = coverImageFilePath ? await uploadFile(coverImageFilePath) : null

    if (!avatarImageRes) {
        throw new ApiErrorHandler(400,
            "User image not uploaded successfully.Please Try again")
    }



    const createdUser = await User.create({
        fullName,
        avatar: avatarImageRes.url,
        coverImage: coverImageRes ? coverImageRes.url : "",
        email,
        password,
        userName: userName.toLowerCase()
    })


    const validatedUser = await User.findById(createdUser?._id).select("-password -refreshToken")
    if (!validatedUser) {
        throw new ApiErrorHandler(500,
            "User not created in database.Please try again, after sometime.")
    }

    return res.status(201).json(new ApiResponseHandler(
        200,
        validatedUser,
        "User registered successfully."
    ))
})


const loginUserController = asyncHandler(async function (req, res) {
    const { email = '', userName = '', password = '' } = req?.body

    if (!(email || userName)) {
        throw new ApiErrorHandler(400, "Username or email is required.")
    }

    let existingUser = await User.findOne({
        $or: [{ email }, { userName }]
    })

    if (!existingUser) {
        throw new ApiErrorHandler(404, "User does not exists.")
    }

    const isPasswordValid = await existingUser.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiErrorHandler(400, "Invalid user credentials.")
    }

    const { accessToken = '', refreshToken = '' } = await generateAccessAndRefreshToken(existingUser?._id)

    if (!(accessToken || refreshToken)) {
        throw new ApiErrorHandler(400, "Access token and refresh token not generated successfully.")
    }

    existingUser = await User.findById(existingUser?._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponseHandler(
            200,
            { user: existingUser, accessToken, refreshToken },
            "User Logged in successfull."
        ))
})

const logoutUserController = asyncHandler(async function (req, res) {
    await User.findByIdAndUpdate(
        req?.user?._id,
        {
            $set: { refreshToken: null }
        },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: true
    }


    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponseHandler(200, null, "User logout successfully.")
        )

})

const refreshAccessToken = asyncHandler(async function (req, res) {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken || ''
        if (!incomingRefreshToken) {
            throw new ApiErrorHandler(400, "Invaild refresh token.Please login manually.")
        }
    
        const decodedTokenInfo =  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        if (!decodedTokenInfo) {
            throw new ApiErrorHandler(400, "Invaild refresh token.Please login manually.")
        }
    
        const user = await User.findById(decodedTokenInfo?._id)
    
        if (!user) {
            throw new ApiErrorHandler(400, "User not found.Invaid request.")
        }
    
        if (user?.refreshToken && incomingRefreshToken !== user?.refreshToken) {
            throw new ApiErrorHandler(400, "Refresh Token is expired or used. ")
        }
    

    
        const { accessToken = '', refreshToken = '' } = await generateAccessAndRefreshToken(user?._id)
    console.debug(accessToken,refreshToken)
        if (!(accessToken || refreshToken)) {
            throw new ApiErrorHandler(500, "Error in generating tokens.")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponseHandler(
                200,
                { user, accessToken, refreshToken },
                "Access Token refreshed successfully."
            ))
    } catch (err) {
        throw new ApiErrorHandler(400, err?.message||"Invalid refresh token.")    
    }


})

export {
    registerUserController,
    loginUserController,
    logoutUserController,
    refreshAccessToken
}