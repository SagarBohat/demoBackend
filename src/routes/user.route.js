import {Router } from "express"
import { registerUserController } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"

const userRouter =  Router()

userRouter.route("/register").post(
    upload.fields([{name:"avatar",maxCount:1},{name:"coverImage",maxCount:1}]),
    registerUserController
)

export {userRouter}