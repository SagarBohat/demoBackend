class ApiErrorHandler extends Error {
    constructor(
        statusCode,
        errors = [],
        message="Something went wrong.",
        stack="",
    ){
        super(message)
        this.message = message
        this.errors= errors
        this.statusCode = statusCode
        this.success = false
        this.data = null


        if(stack) {
            this.stack = stack
        }else {
            Error.captureStackTrace(this,this.constructor)
        }

    }
}



export {ApiErrorHandler}