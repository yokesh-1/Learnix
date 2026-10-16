
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
    },
});

export default upload;
