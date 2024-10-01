import multer from "multer";
import fs from "fs";

const imageUpload = (id, filePath) => {
  //check images file exists
  if (!fs.existsSync("images")) {
    //not exists yet create new one images file
    fs.mkdirSync("images");
  }
  //check images file inside required directory
  if (!fs.existsSync(`images/${filePath}`)) {
    //not exists yet create new one request file
    fs.mkdirSync(`images/${filePath}`);
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `images/${filePath}`);
    },
    filename: (req, file, cb) => {
      cb(
        null,
        //file originalname remove and slice only .last extension
        `${id}${
          new Date().getTime() +
          file.originalname.slice(
            file.originalname.lastIndexOf("."),
            file.originalname.length
          )
        }`
      );
    },
  });

  return multer({ storage: storage });
};

export default imageUpload;
