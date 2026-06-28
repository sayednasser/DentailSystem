import { Router } from "express";
import { successResponse, TokenTypeEnum } from "../../common/index.js";
import { logout, profile, profileCoverPicture, profilePicture, rotateToken, shareProfile, updatePassword,updateProfile } from "./user.service.js";
import { uploadCloud } from "../../common/types/multer/cloud.multer.js";
import { filedValidation } from "../../common/types/multer/multer.validation.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./user.validation.js"
const router = Router();

router.get("/", authentication(), async (req, res) => {
    const data = await profile(req.user)
    return successResponse({ res, status: 200, data });
});

router.patch("/profile-picture", authentication(), uploadCloud({ validation: filedValidation.image }).single("attachment"), async (req, res) => {
    const data = await profilePicture(req.file, req.user)
    return successResponse({ res, status: 200, data }); 
});
router.post("/logout", authentication(), async (req, res, next) => {
    const status = await logout(req.body, req.user, req.decode)
    return successResponse({ res, status })
})
router.patch("/update-Password", authentication(), validation(validators.updatePassword), async (req, res, next) => {
    const credentials = await updatePassword(req.body, req.user, `${req.protocol}://${req.host}`)
    return successResponse({ res, data: credentials })
})
router.patch("/profile-cover-picture",
    authentication(),
    uploadCloud({ validation: filedValidation.image }).single("attachment"),
    validation(validators.profileCoverImage),
    async (req, res, next) => {
        const account = await profileCoverPicture(req.file, req.user)
        return successResponse({ res, data: account })
});
router.get("/:userId/share", validation(validators.shareProfile)
    , async (req, res) => {
        const user = await shareProfile(req.params.userId, req.user)
        return successResponse({ res, data: { user } })
})
router.get("/rotate-token", authentication(TokenTypeEnum.refresh), async (req, res, next) => {
    const user = await rotateToken(req.user, req.decode, `${req.protocol}://${req.host}`)
    return successResponse({ res, data: { user } })
})

router.post("/update-profile", authentication(), async (req, res, next) => {
    console.log(req.body);
    const account = await updateProfile(req.body, req.user, `${req.protocol}://${req.host}`)
    return successResponse({ res, data: account })
})
export default router;