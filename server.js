// const express = require("express");
// const app = express();
// const port = 8080;
// const path = require("path");
// const { Storage } = require("@google-cloud/storage");
// const Multer = require("multer");


// const multer = Multer({
//   storage: Multer.memoryStorage(),
//   limits: {
//     fileSize: 5 * 1024 * 1024, // No larger than 5mb, change as you need
//   },
// });

// let projectId = "firstmediauploadtogogglecloud"; // Get this from Google Cloud
// let keyFilename = "googel-cloud-key.json"; // Get this from Google Cloud -> Credentials -> Service Accounts
// const storage = new Storage({
//   projectId,
//   keyFilename,
// });
// const bucket = storage.bucket("e-commerece"); // Get this from Google Cloud -> Storage

// // Gets all files in the defined bucket
// app.get("/upload", async (req, res) => {
//   try {
//     const [files] = await bucket.getFiles();
//     res.send([files]);
//     console.log("Success");
//   } catch (error) {
//     res.send("Error:" + error);
//   }
// });
// // Streams file upload to Google Storage
// app.post("/upload", multer.single("imgfile"), (req, res) => {
//   console.log("Made it /upload");
//   try {
//     if (req.file) {
//       console.log("File found, trying to upload...");
//       const blob = bucket.file(req.file.originalname);
//       const blobStream = blob.createWriteStream();

//       blobStream.on("finish", () => {
//         res.status(200).send("Success");
//         console.log("Success");
//       });
//       blobStream.end(req.file.buffer);
//     } else throw "error with img";
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });
// // Get the main index html file

// // Start the server on port 8080 or as defined
// app.listen(port, () => {
//   console.log(`Server started on port ${port}`);
// });

const express = require("express");
const app = express();
const port = 8080;
const Multer = require("multer");
const { Storage } = require('@google-cloud/storage');

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // No larger than 5mb, change as needed
  },
});

const projectId = "firstmediauploadtogogglecloud"; // Replace with your project ID
const keyFilename = "googel-cloud-key.json"
const storage = new Storage({ projectId, keyFilename });

const bucketName = "e-commerece"; // Replace with your bucket name
const bucket = storage.bucket(bucketName);

app.use(express.json());

app.get("/upload", async (req, res) => {
  try {
    const [files] = await bucket.getFiles();
    res.send(files.map(file => file.name));
  } catch (error) {
    res.status(500).send("Error: " + error);
  }
});

app.post("/upload", multer.single("imgfile"), async (req, res) => {
  try {
    if (!req.file) throw "No file received";

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", err => {
      res.status(500).send("Error uploading file: " + err);
    });

    blobStream.on("finish", () => {
      res.status(200).send("File uploaded successfully");
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).send("Error: " + error);
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
