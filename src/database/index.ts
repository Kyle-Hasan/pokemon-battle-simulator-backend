import mongoose from 'mongoose';

import dotenv from 'dotenv';



export const connectDB = async () => {
    try {
        dotenv.config();
        const MONGO_URI = process.env.MONGO_URI || 'ewr';

        console.log("logging from mongo")
        console.log(process.env)
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};
