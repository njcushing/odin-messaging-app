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
    {
        getters: true,
        timestamps: true,
    }
);

ImageSchema.set("toObject", { virtuals: true });
ImageSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Image", ImageSchema);
