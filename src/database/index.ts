import mongoose from 'mongoose';

import dotenv from 'dotenv';



export const connectDB = async () => {
    try {
        dotenv.config();
        const MONGO_URI = process.env.MONGO_URI || 'ewr';

    
        await mongoose.connect(MONGO_URI);
        
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};
