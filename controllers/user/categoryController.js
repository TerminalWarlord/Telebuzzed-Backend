const Category = require('../../models/category');



const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({
            name: 1
        });
        res.json({
            result: categories
        })
    }
    catch (err) {
        res.status(401).json({
            result: {
                message: "Could not fetch categories!"
            }
        })
    }
}



module.exports = {
    getCategories
}