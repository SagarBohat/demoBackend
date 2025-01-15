import dotenv from "dotenv"
import connectToDB from "./db/index.js"
import {app} from './app.js'


dotenv.config({
    path:'./env'
})

connectToDB()
.then(()=>{
    app.on('error',(err)=>{
        console.log("Error in express app ", err)
    })

    app.listen(process.env.PORT||8000,()=>{
        console.log("App is listening to port",process.env.PORT)
    })

})
.catch((err)=>{
    console.log("Error in connnection in db",err)
})
