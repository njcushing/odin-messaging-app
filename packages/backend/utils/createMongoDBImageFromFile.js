import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import mongoose from "mongoose";
import Image from "../models/image.js";

const createMongoDBImageFromFile = async (imageFilePathLocal, validator) => {
    const imageFilePathAbsolute = `${__dirname}${imageFilePathLocal}`;
    const imageBuffer = fs.readFileSync(imageFilePathAbsolute);
    const imageArray = Array.from(new Uint8Array(imageBuffer));
    const valid = validator(imageArray);
    if (!valid.status) {
        const error = new Error(valid.message.front);
        error.status = 500;
        return [null, error];
    }

    const imageId = new mongoose.Types.ObjectId();
    const image = new Image({
        _id: imageId,
        "img.data": imageArray,
        "img.contentType": "image/png",
    });
    let imageSaveError = null;
    await image.save().catch((error) => {
        imageSaveError = error;
    });
    if (imageSaveError) {
        const error = new Error(
            "Something went wrong when trying to generate a default profile image"
        );
        error.status = 500;
        return [null, error];
    }

    return [imageId, null];
};

export default createMongoDBImageFromFile;