import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}?appName=AtlasCluster`;
        const uri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@ac-ilxellv-shard-00-00.y990qk3.mongodb.net:27017,ac-ilxellv-shard-00-01.y990qk3.mongodb.net:27017,ac-ilxellv-shard-00-02.y990qk3.mongodb.net:27017/${process.env.MONGO_DB}?replicaSet=atlas-jdkfr8-shard-0&tls=true&authSource=admin`;
        console.log("Mongo URI : ", uri);
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
