import { ACCESS_EXPIRES_IN, APPLICATION_NAME, REFRESH_EXPIRES_IN } from "../../../config/config.js";
import { comparePassword, ConflictException, createLoginCredentials, decrypt, deleteFile, deleteFiles, deleteKey, hashPassword, keys, logoutEnum, NotFoundException, revokeTokenBaseKey, revokeTokenKey, set, uploadFile, uploadFiles } from "../../common/index.js";
import { userModel } from "../../DB/model/user.model.js";


export const profile = async (user) => {
    return user
}
export const shareProfile = async (userId) => {
    const profile = await userModel.findOne({ _id: userId }).select(['name', 'firstName', 'middleName', 'lastName', 'email', 'phone', 'profilePicture', 'profileCoverPicture'])
    if (!profile) {
        throw NotFoundException({ message: "user is not found" })
    }
    if (profile.phone) {
        profile.phone = await decrypt(profile.phone)
    }
    return profile
}
export const profilePicture = async (file, user) => {
    if (user.profilePicture?.public_id) {
        await deleteFile(user.profilePicture.public_id)
    }
    const { public_id, secure_url } = await uploadFile({ FilePath: file.path, folder: `${APPLICATION_NAME}/users/${user._id}/profile` })
    user.profilePicture = { public_id, secure_url }
    await user.save()
    return user

}
export const profileCoverPicture = async (file, user) => {

    if (user.profileCoverPicture?.public_id) {
        await deleteFile(user.profileCoverPicture.public_id)
    }
    const { public_id, secure_url } = await uploadFile({ FilePath: file.path, folder: `${APPLICATION_NAME}/users/${user._id}/cover` })
    user.profileCoverPicture = { public_id, secure_url }
    await user.save()
    return user

}
export const rotateToken = async (user, { jti, iat }, issuer) => {

    const tokenExpiryTime = iat * 1000 + ACCESS_EXPIRES_IN * 1000;

    if (Date.now() < tokenExpiryTime) {
        throw ConflictErrorException({ message: "Current access token is still valid" });
    }
    await set({
        key: revokeTokenKey({ userId: user._id, jti }),
        value: jti,
        ttl: iat + ACCESS_EXPIRES_IN
    })

    return await createLoginCredentials(user, issuer)
};

export const logout = async (body = {}, user, { jti, iat }) => {
    const { flag } = body;
    let status = 200;
    switch (flag) {
        case logoutEnum.All:
            user.changeCredentialTime = new Date();
            await user.save();

            await deleteKey(await keys(revokeTokenBaseKey(user._id)));
            break;

        default:
            await set({
                key: revokeTokenKey({ userId: user._id, jti }),
                value: jti,
                ttl: iat + REFRESH_EXPIRES_IN,
            });

            status = 201;
            break;
    }

    return status;
};
export const updatePassword = async ({ oldPassword, password }, user, issuer) => {
    if (!await comparePassword({ plainText: oldPassword, hashText: user.password })) {
        throw ConflictException({ message: "invalid old password" })
    }
    for (const hash of user.oldPassword || []) {
        const isUsedBefore = await comparePassword({
            plainText: password,
            hashText: hash,
        });

        if (isUsedBefore) {
            throw ConflictException({
                message: "this password already exists before",
            });
        }
    }
    user.oldPassword.push(user.password)
    if (user.oldPassword.length > 3) {
        user.oldPassword.shift();
    }
    user.password = await hashPassword({ plainText: password })
    user.changeCredentialTime = new Date()
    await user.save()
    await deleteKey(await keys(revokeTokenBaseKey(user._id)))
    return await createLoginCredentials(user, issuer)


};
export const updateProfile = async (inputs, user) => {
    const { fullName, phone } = inputs;

    const updateData = {};

    if (fullName) {
        const parts = fullName.trim().split(/\s+/);

        updateData.firstName = parts[0] || "";
        updateData.middleName = parts.length > 2 ? parts.slice(1, -1).join(" ") : "";
        updateData.lastName = parts.length > 1 ? parts[parts.length - 1] : "";
    }

    if (phone !== undefined) {
        updateData.phone = phone;
    }

    const updatedUser = await userModel.findByIdAndUpdate(
        user._id,
        { $set: updateData },
        {
            new: true,
            runValidators: true
        }
    );

    const result = updatedUser.toObject();



    return result;
};




