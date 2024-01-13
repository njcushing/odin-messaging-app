import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ImageSchema = new Schema(
    {
        name: { type: String },
        alt: { type: String },
        img: {
            data: Buffer,
            contentType: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Image", ImageSchema);
