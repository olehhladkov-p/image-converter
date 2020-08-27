const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const JSZip = require('jszip');

const app = express();

let zip;

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.json());
app.use(express.static(publicDirectoryPath));

app.get('', (req, res) => {
  res.sendFile(path.join(publicDirectoryPath, 'index.html'));
});

app.post('/download', async (req, res) => {
  if (!zip) {
    return res.status(403).send({
      success: false,
      error: 'Nothing to download! First upload a file!',
    });
  }

  const zipPath = path.join(publicDirectoryPath, `download_${Date.now()}.zip`);
  const outputFile = fs.createWriteStream(zipPath);

  zip
    .generateNodeStream()
    .pipe(outputFile)
    .on('finish', () => {
      res.download(outputFile.path, null, (error) => {
        fs.unlinkSync(outputFile.path);
      });
    });
});

app.post(
  '/upload',
  multer().single('image_source'),
  async (req, res) => {
    try {
      if (!req.file) {
        throw new Error('Please upload an image source');
      }

      const fileNameWithoutExtension = req.file.originalname.replace(
        /\.[^/.]+$/,
        ''
      );

      const fileTypes = req.body.image_type;

      if (!fileTypes) {
        throw new Error('Please choose at least one image type');
      }

      zip = new JSZip();

      const sizesList = req.body.image_sizes || [];

      const imagesParams = fileTypes
        .map((type) => {
          return sizesList.map(({ width, height }) => {
            const newItem = {
              type,
            };

            newItem.width = Number(width) || null;
            newItem.height = Number(height) || null;

            return newItem;
          });
        })
        .flat();

      await Promise.all(
        imagesParams.map(async ({ type, width, height }) => {
          const buffer = await sharp(req.file.buffer)
            .resize({ width, height })
            .toFormat(type)
            .toBuffer();

          zip.file(
            `${fileNameWithoutExtension}${width ? `_w${width}` : ''}${
              height ? `_h${height}` : ''
            }.${type}`,
            buffer
          );
        })
      );

      res.send({
        success: true,
        download_url: '/download',
      });
    } catch (error) {
      res.status(400).send({
        success: false,
        error: error.message,
      });
    }
  },
  (error, req, res, next) => {
    res.status(400).send({
      success: false,
      error: error.message,
    });
  }
);

app.get('/archive', (req, res) => {
  res.download(output.path);
});

app.listen(port, () => {
  console.log(`Server is up on http://localhost:${port}.`);
});
