const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index", {
    data: [],
    error: null
  });
});

app.post("/upload", upload.single("csvfile"), (req, res) => {
  if (!req.file) {
    return res.render("index", {
      data: [],
      error: "Tidak ada file yang diupload. Silakan pilih file CSV terlebih dahulu."
    });
  }

  const filePath = req.file.path;
  const data = [];

  fs.createReadStream(filePath)
    .pipe(csv({ skipEmptyLines: true }))
    .on("data", (row) => data.push(row))
    .on("end", () => {
      console.log("Parsed data:", data.length, "records");

      // Validasi data
      if (data.length === 0) {
        return res.render("index", {
          data: [],
          error: "File CSV kosong atau tidak valid. Pastikan file memiliki data dan header."
        });
      }

      // Validasi struktur data
      const headers = Object.keys(data[0]);
      if (headers.length < 2) {
        return res.render("index", {
          data: [],
          error: "File CSV harus memiliki minimal 2 kolom (label dan minimal 1 data numerik)."
        });
      }

      res.render("index", {
        data,
        error: null
      });
    })
    .on("error", (error) => {
      console.error("Error parsing CSV:", error);
      res.render("index", {
        data: [],
        error: "Error memproses file CSV. Pastikan format file benar."
      });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});