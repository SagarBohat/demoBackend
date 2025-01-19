const asyncHandler = (fn)=> async(req,res,next)=>{
    try {
       return await fn(req,res,next)
    } catch (err) {
       return res.status(err.statusCode||400).json({
            success:false,
            message:err?.message || 'Something went wrong.'
        })
    }
}


export {asyncHandler}