const mongoose = require("mongoose");

const schemaFile = new mongoose.Schema({
 File:String
})


const FileName= mongoose.model("file",schemaFile)

export default FileName;