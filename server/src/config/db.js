import mongoose from 'mongoose'
import config from './dotenv.js'

const connectDB = async()=>{
    try{
        await mongoose.connect(config.MONGODB_URI)
        console.log('DB connect')
    }catch(error){
        console.log(error , 'DB Error')
        return Promise.reject(error)
    }
}

export default connectDB