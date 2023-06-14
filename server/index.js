const express=require("express")
const cors =require("cors")
const multer = require("multer")
const fs= require("fs")
const sharp = require("sharp")
const shortId= require("shortid")
const archiver = require("archiver")
const gzip=require("compression");
const mongoose = require("mongoose")

//database

const app=express()

const storageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the destination folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now().toString()+file.originalname); // Use the original file name
  },
})

const upload = multer(
  {storage:storageEngine,
    limits:10000000,
  }
);

app.use(cors())
app.use(express.urlencoded({extended:true, limit:"50mbs"}))
app.use(express.json({limit:"50mbs"}))
app.use(gzip());

app.post("/convert",upload.array("images",20), (req, res)=>{
try {
   const {from, to}=req.body;
    console.log(from,to)
  
   const id=shortId.generate()
   console.log(id)
   const path= `./converted/${id}/`
    console.log(path)

   fs.mkdir(path,{},(err)=>{
    console.log(err)
   })


   //convert each file respectively
   req.files.forEach(function (file,idx){
    console.log("started converting files")
    if(["jpeg","jpg"].some((item)=>item==to)){
      console.log("dealing with jpg",to,from)
      sharp(file.path).jpeg().toFile(path + file.filename.replace(`.${from}`, `.${to}`)).then(() => {
        console.log('Image converted successfully!');
      }).catch((err) => {
        console.error('Error converting image:', err);
     })
    } else{
      console.log("dealing with png", to,from)
      sharp(file.path).png().toFile(path + file.filename.replace(`.${from}`, `.${to}`)).then(() => {
        console.log('Image converted successfully!');
      }).catch((err) => {
        console.error('Error converting image:', err);
     })
    }
  })
  
  //compress the files into a gzip and sens back to the user
  const outputPath = `./converted/${id}.zip`
  console.log(outputPath)
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip",{zlib:{level:9}})
  //when done converting to zip
  output.on("close",(err)=>{
    if(err) return err;
    console.log("done converting")
    // fs.rm(path,{recursive:true,force:true},(err)=>{
    //   if(err){
    //     console.log(err)
    //   }
    //   console.log("done removing directory")
    // })  
   return  res.status(200).json({name:id})
  })
  
  //when an error occurs
  archive.on("error",(err)=>{
    console.error(err);
  })
  
  //pipe the data from the archive to the final file
 archive.pipe(output);


  //append all files from the source folder to the archiver
  archive.directory(path,false)

  archive.finalize();


} catch (error) {
  res.status(500).send("server error")
}
})


//downlaod the image

app.get("/:id", (req, res)=>{
  try {
    console.log(req.params.id)
    const name=req.params.id;
    const outputPath = `./converted/${name}.zip`;
   console.log(name)
    res.status(200).download(outputPath)  
  } catch (error) {
    console.log(error)
    res.status(500).json("server error")
  }
})


app.listen(4000,(err)=>{
  if(err) throw new Error("failed to ruin app")
  console.log("app running on port 4000")
})
// mongoose.connect("mongodb://localhost:27027/imageconvertify",{
//  useNewUrlParser:true,
//  useUnifiedTopology:true
// }).then(()=>{
//   console.log("successfully connected to database")

// }).catch(err=>{
//   console.log("failed to connect to database")
// })