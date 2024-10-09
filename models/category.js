const mongoose = require('mongoose');



const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
});



categorySchema.methods.generateSlug = function () {
    let slug = this.name.toLowerCase();

    // Replace spaces and special characters with hyphens
    slug = slug.replace(/[^a-z0-9\s-]/g, '');  // Remove special characters
    slug = slug.replace(/\s+/g, '-');  // Replace spaces with hyphens
    slug = slug.replace(/-+/g, '-');   // Ensure no multiple hyphens

    this.slug = slug;
}
module.exports = mongoose.model('Category', categorySchema);




