import React, {useEffect, useState} from 'react'
import axios from "axios"


function Index() {
  const [formats, setFormats]=useState([])
  const [images, setImages]= useState("")
  const [url,setUrl]= useState("")
  const [download, setDownload]= useState(true);
    function handleSubmit(e:React.FormEventHandler<HTMLFormElement> ){
      e.preventDefault()
      const formData = new FormData()
      console.log(images)
      console.log(formats)
      formData.append("from",formats[0].toLowerCase())
      formData.append("to",formats[1].toLowerCase())
      for(let i=0;i<images.length;i++){
        formData.append(`images`,images[i])
      }

   const postData= async ()=>{
    await axios.post("http://localhost:4000/convert",formData).then(response=>{
      console.log(response)
      setUrl(response.data.name)
      console.log(response.data.name);
      }).catch(err=>{
        console.error(err);
      })
   }


   postData()
    }
    function handleChange(e:React.FormEventHandler<HTMLInputElement>){
        setImages(Array.from(e.target.files))
    }
     
    //choose conversion type
    function handleChoice(e){
      const text:string=e.target.innerText;
      const conservionArray:String[]=text.split("to").map(item=>item.trim())
      setFormats(conservionArray)
      
      const allActionButtons= document.querySelectorAll(".action-buttons > button")
      if(allActionButtons){
        allActionButtons.forEach((button)=>{
          button.classList.remove("chosen")
        })
      }
      e.target.classList.add("chosen")
    } 
    useEffect(() => {
      console.log(formats)
    }, [formats])

 function handleImageDownload(){
  const getImages= async ()=>{
    await axios.get(`http://localhost:4000/${url}`,{responseType:'blob'}).then(response=>{
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'image.zip'); // Set the desired filename for the downloaded image
      document.body.appendChild(link);
      link.click();
      link.remove();
    }).catch(err=>{
      console.error(err)
    })
   }
   getImages()
 }
    
  return (
    <section>
      <h1>Convert Images</h1>
      <div className='action-buttons'>
        <button onClick={handleChoice} >JPG to PNG</button>
        <button onClick={handleChoice}>PNG to JPG</button>
        <button onClick={handleChoice}>JPEG to PNG</button>
        <button onClick={handleChoice}>PNG to JPEG</button>
        <button onClick={handleChoice}>JPG to JPEG</button>
        <button onClick={handleChoice}>JPEG to JPG</button>
      </div>
      <form onSubmit={handleSubmit} encType='multipart/form-data'>
            {
              formats.length>0?( <div className='input-container'>
              <input type="file" name="image" id="image-upload"  onChange={e=>handleChange(e)} multiple={true} accept={`.${formats[0]?.toLowerCase()}`}/>
              </div>):null
            }
            <button className="upper" type='submit' disabled={formats.length===0} style={{background:(formats.length>0)?"#8fb4ff":"gray",cursor:(formats.length>0)?"pointer":"default"}}>submit</button>
        </form>
        <button className="upper" onClick={handleImageDownload} disabled={!download} style={{background:(download)?"#a2ff8f":"gray",cursor:(download)?"pointer":"default"}}>Download</button>
    </section>
 
  )
}

export default Index