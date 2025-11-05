const mongoose =require("mongoose")
const dotenv = require("dotenv").config();

const connectDB = async()=>{
try {
    const conn =await mongoose.connect(process.env.MOGODB_URL)
    console.log(`Mongodb connect successfully : ${conn.connection.host}`)
} catch (error) {
    console.log(`Error: ${error.message}`)
    process.exit(1)
}
}

module.exports=connectDB