import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import { verifyJWT, optionalAuth } from "../middlewares/auth.middlware.js";

const router = Router();

router.route("/").post(verifyJWT, createPlaylist);

router.route("/user/:userId").get(optionalAuth, getUserPlaylists);
router.route("/my").get(verifyJWT, (req, res, next) => {
    req.params.userId = req.user._id;
    getUserPlaylists(req, res, next);
});

router.route("/:playlistId")
    .get(optionalAuth, getPlaylistById)
    .patch(verifyJWT, updatePlaylist)
    .delete(verifyJWT, deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(verifyJWT, addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(verifyJWT, removeVideoFromPlaylist);

export default router;
