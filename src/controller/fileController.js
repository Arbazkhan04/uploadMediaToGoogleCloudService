const processFile = require("../Midleware/upload");
const { format } = require("util");
const { Storage } = require("@google-cloud/storage");

const storage = new Storage({ projecctId:"firstmediauploadtogogglecloud" , keyFilename: "googel-cloud-key.json" });
const bucket = storage.bucket("e-commerece");

const upload = async (req, res) => {
  try {
    await processFile(req, res);

    if (!req.file) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      console.error(err);
      res.status(500).send({ message: err.message });
    });

    blobStream.on("finish", async () => {
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );

      try {
        await bucket.file(req.file.originalname).makePublic();
      } catch (err) {
        console.error(err);
        return res.status(500).send({
          message: `Uploaded the file successfully: ${req.file.originalname}, but public access could not be granted!`,
          url: publicUrl,
        });
      }

      res.status(200).send({
        message: "Uploaded the file successfully: " + req.file.originalname,
        url: publicUrl,
      });
    });

    blobStream.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
};

const getListFiles = async (req, res) => {
  try {
    const [files] = await bucket.getFiles();
    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file.name,
        url: file.metadata.mediaLink,
      });
    });

    res.status(200).send(fileInfos);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Unable to read list of files!",
    });
  }
};

const download = async (req, res) => {
  try {
    const [metaData] = await bucket.file(req.params.name).getMetadata();
    res.status(302).redirect(metaData.mediaLink);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Could not download the file. " + err,
    });
  }
};

module.exports = {
  upload,
  getListFiles,
  download,
};
