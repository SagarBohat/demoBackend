import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

async function connectToDB() {
    try {
     const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
     console.log(`\n MONGO DB CONNECTED!! DB HOST : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error('ERROR IN CONNECT TO DB',error)
        process.exit(1)
    }
    
}

export default connectToDB