import ProfileImage from "@/components/ProfileImage";

import * as validate from "../../../../utils/validateUserFields.js";

export const defaultProps = () => ({
    src: new Uint8Array(),
    alt: "",
    status: null,
});

export const fromUser = (user) => {
    const imageExtracted = defaultProps();
    let found = false;
    if (user && user.constructor === Object) {
        if ("preferences" in user) {
            const preferences = user.preferences;
            if (preferences && preferences.constructor === Object) {
                if ("profileImage" in preferences) {
                    const profileImage = preferences.profileImage;
                    if (profileImage && profileImage.constructor === Object) {
                        if ("img" in profileImage) {
                            imageExtracted.src = Uint8Array.from(profileImage.img.data.data);
                            found = true;
                        }
                        if ("alt" in profileImage) {
                            imageExtracted.alt = profileImage.alt;
                        }
                    }
                }
            }
        }
        if ("status" in user) {
            const validStatus = validate.status(user.status);
            if (validStatus.status) imageExtracted.status = user.status;
        }
    }
    return { found: found, image: imageExtracted };
};

export const fromChat = (chat) => {
    const imageExtracted = defaultProps();
    let found = false;
    if (chat && chat.constructor === Object) {
        if ("image" in chat) {
            const image = chat.image;
            if (image && image.constructor === Object) {
                if ("img" in image) {
                    imageExtracted.src = Uint8Array.from(image.img.data.data);
                    found = true;
                }
                if ("alt" in image) {
                    imageExtracted.alt = image.alt;
                }
            }
        }
    }
    return { found: found, image: imageExtracted };
};

export const fromMessage = (message) => {
    const imageExtracted = defaultProps();
    let found = false;
    if (message && message.constructor === Object) {
        if ("image" in message) {
            const image = message.image;
            if (image && image.constructor === Object) {
                if ("img" in image) {
                    imageExtracted.src = Uint8Array.from(image.img.data.data);
                    found = true;
                }
                if ("alt" in image) {
                    imageExtracted.alt = image.alt;
                }
            }
        }
    }
    return { found: found, image: imageExtracted };
};
