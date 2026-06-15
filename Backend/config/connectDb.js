import mongoose from "mongoose";

const connectDb = async () => {
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`DataBase Connected! DB HostName ${connectionInstance.connection.host}`)
    } catch(error){
        console.log(`DataBase Error ${error}`);
    }
}

export default connectDb