const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const FLASH_DISK_PATH = "/media/maeel/DAE5-2E19"; // Adjust this path to match your flash disk path

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const relativePath = req.body.path || "";
    const dirPath = path.join(FLASH_DISK_PATH, "DATA-EKSTERNAL", relativePath);

    // Ensure the directory exists
    fs.mkdir(dirPath, { recursive: true }, (err) => {
      if (err) {
        console.error("Failed to create directory", err);
        return cb(err);
      }
      cb(null, dirPath);
    });
  },
  filename: (req, file, cb) => {
    const today = new Date();
    const date = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    cb(
      null,
      `${date}${month < 10 ? `0${month}` : month}${year}-${file.originalname}`
    );
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.status(200).send("my server");
});

// Endpoint to get the list of files/directories
app.get("/files", (req, res) => {
  const relativePath = req.query.path || "";
  const dirPath = path.join(FLASH_DISK_PATH, relativePath);

  fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error("Failed to read directory", err);
      return res.status(500).json({ error: "Failed to read directory" });
    }

    const result = files.map((file) => ({
      name: file.name,
      isDirectory: file.isDirectory(),
    }));

    res.json(result);
  });
});

// Endpoint to download a file
app.get("/files/download", (req, res) => {
  const { filename } = req.query;
  if (!filename) {
    return res.status(400).json({ error: "Filename is required" });
  }

  const filePath = path.join(FLASH_DISK_PATH, "DATA-EKSTERNAL", filename);

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File not found", err);
      return res.status(404).json({ error: "File not found" });
    }
    res.download(filePath);
  });
});

// Endpoint to upload a file
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "File uploaded successfully", file: req.file });
  } catch (error) {
    console.error("File upload failed", error);
    res.status(500).json({ message: "File upload failed", error });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
