import express from "express";
import multer from "multer";
import fs, { PathLike } from "fs";

const router = express.Router();

const upload = multer({ dest: "public" });

router.post("/", upload.single("file"), (req, res, next) => {
  const originalname = req.file?.originalname;
  const path = req.file?.path as PathLike;

  const newPath = path + "_" + originalname;

  console.log("Path generado por multer: " + path);
  console.log("Nuevo path: " + newPath);

  fs.renameSync(path, newPath);

  res.send("Fichero subido correctamente!");
  console.log("Fichero subido correctamente!");
});

module.exports = { fileUploadRouter: router };
