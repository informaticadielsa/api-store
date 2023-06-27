import multer from 'multer';
import fs from 'fs';

const DIR = './public/img/temp';
const DIRPDF = './public/pdf/temp';
const DIRAR = './public/compressed';
const DIREXCEL = './public/excel/temp';
const storage = multer.diskStorage({
  destination: async(req, file, cb) => {
    if(file.mimetype == "application/zip" || file.mimetype == "application/x-zip-compressed"){
        if(!fs.existsSync(DIRAR)){
           await fs.promises.mkdir(DIRAR, { 
                recursive: true
            });
        }
        return cb(null, DIRAR);
    }
    if(file.mimetype == "application/vnd.ms-excel" ||
        file.mimetype ==  "application/msexcel" ||
        file.mimetype ==  "application/x-msexcel" ||
        file.mimetype ==  "application/x-ms-excel"  ||
        file.mimetype ==  "application/x-excel" ||
        file.mimetype ==  "application/x-dos_ms_excel"  ||
        file.mimetype ==  "application/xls" ||
        file.mimetype ==  "application/x-xls" ||
        file.mimetype ==  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){
        if(!fs.existsSync(DIREXCEL)){
           await fs.promises.mkdir(DIREXCEL, { 
                recursive: true
            });
        }
        return cb(null, DIREXCEL);
    }
    if(file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"){
        if(!fs.existsSync(DIR)){
           await fs.promises.mkdir(DIR, { 
               recursive: true 
            });
        }
        return cb(null, DIR);
    }
    if(file.mimetype == "application/pdf"){
      if(!fs.existsSync(DIRPDF)){
         await fs.promises.mkdir(DIRPDF, { 
             recursive: true 
          });
      }
      return cb(null, DIRPDF);
    }
  },
  filename: async(req, file, cb) => {
    const fileName = String(Date.now()) + '_' +file.originalname.toLowerCase().split(' ').join('-');
    cb(null, fileName);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || 
        file.mimetype == "image/jpg" || 
        file.mimetype == "image/jpeg" || 
        file.mimetype == "application/zip" || 
        file.mimetype == "application/pdf" || 
        file.mimetype == "application/x-zip-compressed" || 
        file.mimetype == "application/vnd.ms-excel"   ||
        file.mimetype ==  "application/msexcel" ||
        file.mimetype ==  "application/x-msexcel" ||
        file.mimetype ==  "application/x-ms-excel"  ||
        file.mimetype ==  "application/x-excel" ||
        file.mimetype ==  "application/x-dos_ms_excel"  ||
        file.mimetype ==  "application/xls" ||
        file.mimetype ==  "application/x-xls" ||
        file.mimetype ==  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      cb(null, true);
    }else {
      cb(null, false);
      req.fileValidationError = 'Only .png, .jpg, .jpeg, .zip, .pdf and xls format allowed!';
    }
  }
});

export default upload;