let express = require("express");
let router = express.Router();
let fs = require("fs");
let pdf = require("../helpers/pdf");
let path = require('path');

router.get('/', (req, res) => {
    try {
        let files = [];
        fs.readdirSync('./public/documents/raw').forEach(file => {
            files.push(file);
        });
        res.status(200).render("nda", { page: 'nda', files: files });
    } catch (error) {
        res.status(500).render("crash", { error: error });
    }
});

router.post('/', async (req, res) => {
    try {
        let vendor = req.body.vendor;
        if (!vendor || vendor.length === 0) {
            res.status(400).render("crash", { error: "No report selected." });
            return;
        }

        // Create one report and send it back
        try {
            console.log(`[INFO] generating the report...`);
            const fileContent = fs.readFileSync(`./public/documents/raw/${vendor}`, 'utf-8');
            const parsedObject = JSON.parse(fileContent);
            await pdf.compileDocFile(parsedObject, `./public/documents/template/Adobe-NDA-Sample.docx`, `./public/documents/processed/output.pdf`);

            console.log(`[INFO] sending the report...`);
            res.status(200).render("preview", { page: 'nda', filename: 'output.pdf' });
        } catch(error) {
            console.log(`[ERROR] ${JSON.stringify(error)}`);
            res.status(500).render("crash", { error: error });
        }
    } catch (error) {
        console.log(`[ERROR] ${JSON.stringify(error)}`);
        res.status(500).render("crash", { error: error });
    }
});

router.get('/preview/:documentName', (req, res) => {
    res.status(200).render("preview", { page: 'students', filename: 'output.pdf' });
});

router.get('/download/:documentName', (req, res) => {
    try {
        res.sendFile(path.resolve(`./public/documents/processed/${req.params.documentName}`));
    } catch (error) {
        res.status(500).render("crash", { error: error });
    }
});

module.exports = router;
