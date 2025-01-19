import multer from "multer";


const diskStorage  = multer.diskStorage({
    destination:function (req,file,callback){
        callback(null,"./public/temp")
    },
    filename:function (req,file,callback) {
     const uniqueSuffix = Date.now()+"-"+Math.round(Math.random()*1E9)
     const  fileName = file.originalname+"-"+uniqueSuffix
     callback(null,fileName)
    }
})

export const upload  = multer({storage:diskStorage})