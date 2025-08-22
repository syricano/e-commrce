import express from 'express'
import sequelize from './db/index.js';


const app = express()
const PORT = process.env.PORT || 3000;

app.use(express.json());


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`)
})


