import multer from "multer";
import path from "path";
import fs from "fs";

// Upload folder
const uploadPath = "uploads";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// File filter (field-based validation)
// const fileFilter = (req, file, cb) => {
//   const ext = path.extname(file.originalname).toLowerCase();
//   const mime = file.mimetype;

//   // ✅ CV → PDF only
//   if (file.fieldname === "cv") {
//     if (mime === "application/pdf" && ext === ".pdf") {
//       return cb(null, true);
//     }
//     return cb(new Error("CV must be a PDF file"), false);
//   }

//   // ✅ All other fields → Images
//   const allowedImageTypes = /jpeg|jpg|png|webp/;
//   const isImage =
//     allowedImageTypes.test(mime) &&
//     allowedImageTypes.test(ext);

//   if (isImage) {
//     return cb(null, true);
//   }

//   return cb(
//     new Error("Only image files are allowed (except CV which must be PDF)"),
//     false
//   );
// };
const imageTypes = /jpeg|jpg|png|webp/;
const pdfTypes = /pdf/;


// Fields jahan PDF allowed hai
const pdfAllowedFields = ["assignmentFiles", "cv", "aadharCard"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  const isImage = imageTypes.test(ext) && imageTypes.test(mime);

  const isPdf = pdfTypes.test(ext) && mime === "application/pdf";
  if (isImage) {
    return cb(null, true);
  }
// ✅ PDF allowed only for specific fields
  if (
    pdfAllowedFields.includes(file.fieldname) &&
    isPdf
  ) {
    return cb(null, true);
  }
  return cb(
    new Error(
      "Invalid file type. Only images are allowed. PDF is allowed only for specific fields."
    ),
    false
  );
  // ✅ Assignment files → PDF + Images allowed
  if (file.fieldname === "assignmentFiles") {
    const allowedTypes = /pdf|jpeg|jpg|png|webp/;

    const isAllowed = allowedTypes.test(ext) && allowedTypes.test(mime);

    if (isAllowed) {
      return cb(null, true);
    }

    return cb(new Error("Assignment files must be PDF or Image"), false);
  }

  // ✅ CV → PDF only (agar future me use ho)
  if (file.fieldname === "cv" || file.fieldname === "aadharCard") {
    if (mime === "application/pdf" && ext === ".pdf") {
      return cb(null, true);
    }
    return cb(new Error("CV must be a PDF file"), false);
  }

  return cb(new Error("Invalid file field"), false);
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB (PDF needs more size)
  },
});

export default upload;
