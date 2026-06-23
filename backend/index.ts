import express from "express"
import cors from "cors"
import axios from "axios"
const app=express()
app.use(express.json())
app.use(cors())

app.get("/find-words",async(req,res)=>{
    const randomnumber=Math.floor(Math.random()*10)
    console.log(randomnumber)
    const lastketteralph = "eytrndklspaomhg";
    const firstletteralph="scbptarmdfglhwe"
    const letter1 = firstletteralph[Math.floor(Math.random() * 14)];
    const letter2 = lastketteralph[Math.floor(Math.random() * 14)];


    const api_response= await axios.get(`https://api.datamuse.com/words?sp=${letter1}???${letter2}`)
    if(api_response.data==null){
        res.json({
            "message":"sorry can you try again"
    })
        return
    }
    console.log(letter1)
    console.log(letter2)
    console.log(api_response.data)
    const word=api_response.data[randomnumber].word


    res.json({
        message:word
    }) 
})
app.listen(8080)