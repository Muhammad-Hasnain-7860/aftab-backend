import express from "express";
import app from './src/app/app.js'
import connectDB from './src/config/db.js'
import config from './src/config/dotenv.js'

await connectDB()

app.listen(config.PORT || 3000, () => {
    console.log('server is running successFully')
})

