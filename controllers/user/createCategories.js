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
    { id: 1, name: 'Utilities' },
    { id: 29, name: 'Animals' },
    { id: 30, name: 'Anime' },
    { id: 31, name: 'Art' },
    { id: 32, name: 'Beauty' },
    { id: 33, name: 'Blogs' },
    { id: 34, name: 'Books' },
    { id: 35, name: 'Celebrities' },
    { id: 36, name: 'Computers & Tech' },
    { id: 37, name: 'Do It Yourself' },
    { id: 38, name: 'Economics' },
    { id: 39, name: 'Entertainment' },
    { id: 40, name: 'Funny' },
    { id: 41, name: 'Games & Apps' },
    { id: 42, name: 'Jobs & Marketing' },
    { id: 43, name: 'Politics' },
    { id: 44, name: 'Programming' },
    { id: 45, name: 'Quotes' },
    { id: 46, name: 'Science' },
    { id: 47, name: 'Self-development' },
    { id: 48, name: 'Travel' },
    { id: 49, name: 'Computer & Tech' },
    { id: 50, name: 'DIY' },
    { id: 51, name: 'Health & Fitness' },
    { id: 52, name: 'Programming & Dev' },
    { id: 53, name: 'Random Talk' }
];


categories.map(async (category) => {
    // Check if the category already exists (case-insensitive)
    const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${category.name}$`, 'i') }
    });

    if (!existingCategory) {
        // If category doesn't exist, create and save it
        const newCategory = new Category({
            name: category.name
        });

        // Generate slug for the new category
        newCategory.generateSlug();

        // Save the new category
        await newCategory.save();
        console.log(`Category '${category.name}' created.`);
    } else {
        // Skip if category already exists
        console.log(`Category '${category.name}' already exists, skipping.`);
    }
});
