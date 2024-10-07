const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


require('dotenv').config();

const app = express();

// bodyparser
app.use(express.json());

app.use(cors());
// app.use(cors({
//     origin: 'http://localhost:5173' 
// }));


const authRoutes = require('./routes/user/auth');
const contentRoutes = require('./routes/user/content');
const adminRoutes = require('./routes/admin/manage');

app.use('/auth', authRoutes);
app.use('/user', contentRoutes);
app.use('/admin', adminRoutes);




app.listen(3000, async () => {
    await mongoose.connect(process.env.MONGODB);
    console.log("Started listening at 3000");
})