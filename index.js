const mysql=require('mysql2')
const express=require('express')
const cors=require('cors')

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Alauddinnn@12",
    database:""
});
console.log('connected')
app.get('/',(req,res)=>{
    res.send('Backend is working fine!');
})
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });