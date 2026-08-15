const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { UPLOADS_DIR, allowedMimeTypes, maxFileSize } = require('../config/storage');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, and PDF files are allowed.'));
    }
  }
});

const processUpload = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase() || '.bin';
  const uniqueName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
  const targetPath = path.join(UPLOADS_DIR, uniqueName);

  if (file.mimetype.startsWith('image/')) {
    // Sharp strips EXIF metadata on output by default unless .withMetadata() is specified.
    // We also use .rotate() to orient the image correctly before removing orientation headers.
    await sharp(file.buffer)
      .rotate()
      .toFile(targetPath);
    console.log(`EXIF metadata stripped from image upload: ${uniqueName}`);
  } else {
    // For PDFs or non-image files, write buffer directly
    fs.writeFileSync(targetPath, file.buffer);
    console.log(`Non-image file uploaded directly: ${uniqueName}`);
  }

  return `/uploads/${uniqueName}`;
};

module.exports = {
  upload,
  processUpload,
};
