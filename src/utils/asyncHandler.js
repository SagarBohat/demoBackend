const asyncHandler = (fn)=> async(req,res,next)=>{
    try {
        await fn(req,res,next)
    } catch (err) {
        res.send(err.statusCode||400).json({
            success:false,
            message:err?.message || 'Something went wrong.'
        })
    }
}


export {asyncHandler}