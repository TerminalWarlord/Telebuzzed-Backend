const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


require('dotenv').config();

const app = express();

// bodyparser
app.use(express.json());

// app.use(cors());


const allowedOrigins = [
    'http://localhost:5173',
    'https://telebuzzed.com',
];

// CORS setup with dynamic origin checking
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));


const authRoutes = require('./routes/user/auth');
const contentRoutes = require('./routes/user/content');
const adminRoutes = require('./routes/admin/manage');
const adminPostRoutes = require('./routes/admin/post');

app.use('/auth', authRoutes);
app.use(contentRoutes);
app.use('/admin', adminRoutes);
app.use(adminPostRoutes);




app.listen(3000, async () => {
    await mongoose.connect(process.env.MONGODB);
    console.log("Started listening at 3000");
})