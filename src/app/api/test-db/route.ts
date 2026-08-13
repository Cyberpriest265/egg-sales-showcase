import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {

            return NextResponse.json({ success: false, error: "MONGODB_URI is not set in .env file" }, { status: 500 });
        }

        //Attempt to connect directly 
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("Process env: ", process.env);

        return NextResponse.json({
            success: true,
            message: "Successfully connected to MongoDB Atlas  🎉"
        });
    } catch (error: any) {
        // If it fails, we catch the error and send the exact message to the browser
        return NextResponse.json({
            success: false,
            error: error.message,
            name: error.name
        }, { status: 500 })
    }
}