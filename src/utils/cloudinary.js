import { v2 as cloudinary } from "cloudinary";
import fs  from 'fs';

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

 async function uploadFile(fileLocation=''){
    try {
        if(fileLocation) {
            const response =  await cloudinary.uploader.upload(fileLocation,{resource_type:"auto"})

            if(response) {
                console.log("File uploaded successfully,: ",response.url)
                fs.unlinkSync(fileLocation)
                return response
            }else {
                console.log("File not uploaded succesfuly!!!")
                return null
            }

        }else {
            console.log("Local file locaiton not found !!!")
            return null
        }
    } catch (error) {
        fs.unlinkSync(fileLocation)
        console.log("Error in cloudinary file upload : ",error)
        return null
    }

}

export {uploadFile}