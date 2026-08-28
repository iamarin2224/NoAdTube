import multer from "multer";
import path from "path";
import fs from "fs";

// Resolve temp upload directory robustly
const getUploadDir = () => {
    let dir = path.resolve("./public/temp");
    if (!fs.existsSync(path.resolve("./public")) && fs.existsSync(path.resolve("./backend/public"))) {
        dir = path.resolve("./backend/public/temp");
    }
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
};

// Ensure directory exists on startup
getUploadDir();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destDir = getUploadDir();
        cb(null, destDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
        cb(null, `${file.fieldname}-${safeBaseName}-${uniqueSuffix}${ext}`);
    }
});

export const upload = multer({ storage: storage });