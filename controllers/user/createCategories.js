const mongoose = require('mongoose');
require('dotenv').config()
mongoose.connect(process.env.MONGODB)

const Category = require("../../models/category");

const categories = [
    { id: 26, name: 'Admin Tools' },
    { id: 15, name: 'Analytics' },
    { id: 4, name: 'Communication' },
    { id: 28, name: 'Cryptocurrency' },
    { id: 5, name: 'Design' },
    { id: 20, name: 'Developer Tools' },
    { id: 2, name: 'Education' },
    { id: 8, name: 'Finance' },
    { id: 21, name: 'Fitness' },
    { id: 7, name: 'Fun' },
    { id: 3, name: 'Games' },
    { id: 9, name: 'Health' },
    { id: 22, name: 'Languages' },
    { id: 23, name: 'Music' },
    { id: 11, name: 'News' },
    { id: 13, name: 'Personal' },
    { id: 25, name: 'Photo & Video' },
    { id: 14, name: 'Shopping' },
    { id: 27, name: 'Social & Fun' },
    { id: 17, name: 'Sports' },
    { id: 24, name: 'TV Series & Movies' },
    { id: 1, name: 'Utilities' }
]


categories.map(async (category) => {
    const md = await Category({
        name: category.name
    })
    md.generateSlug();
    await md.save();
})
