const express = require('express')
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const connection = require('./db');
const projectRoute = require('./routes/projectRoutes')
const authRoute = require('./routes/authRoutes'); 

const port = process.env.PORT || 5000;

dotenv.config()

const app = express()
app.use(morgan('dev'));
app.use(express.json())

app.use(cors({
    origin: 'https://faukirijatul.vercel.app',
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req,res) => {
    res.send('Hello world')
})

app.use('/api', projectRoute)
app.use('/api/auth', authRoute);

app.listen(port, () => {
    connection()
    console.log(`Server running at http://localhost:${port}`)
})