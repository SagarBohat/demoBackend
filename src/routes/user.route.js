import {Router } from "express"
import { 
    registerUserController,
    loginUserController,
    logoutUserController,
    refreshAccessToken,
    changeUserPassword,
    getCurrentUser
 } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwtToken } from "../middlewares/auth.middleware.js"

const userRouter =  Router()

userRouter.route("/register").post(
    upload.fields([{name:"avatar",maxCount:1},{name:"coverImage",maxCount:1}]),
    registerUserController
)

userRouter.route("/login").post(
    loginUserController
)

userRouter.route("/logout").post(
    verifyJwtToken,
    logoutUserController
)

userRouter.route("/refresh-token").post(
    refreshAccessToken
)

userRouter.route("/change-password").post(
    verifyJwtToken,
    changeUserPassword
)

userRouter.route("/get-user-data").post(
    verifyJwtToken,
    getCurrentUser
)

export {userRouter}