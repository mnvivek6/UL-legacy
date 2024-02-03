const { redirect } = require('express/lib/response');
const Category = require('../models/category');
const Product = require('../models/productmodel');


// show category
const formcategory = async (req, res) => {
    try {

        res.render('add-category')
    } catch (error) {
        console.log(error.message);
    }
}
// addcategory

const addcategory = async (req, res) => {
    try {

        const Newcategory = Category({
            name: req.body.categoryname,
            description: req.body.description,
            image: req.file.filename
        })
        console.log(Newcategory);
        const result = await Newcategory.save()
        console.log(result);
        if (result) {
            res.redirect('/admin/category-list')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const showcategory = async (req, res) => {

    try {
        const category = await Category.find()
       
        res.render('category-list', { category })
    } catch (error) {

        console.log(error.message);
    }
}

const updatecategory = async (req, res) => {

    try {

        const category = await Category.findOne({ _id: req.query.id })
        res.render('edit-category', { category })
    } catch (error) {
        console.log(error.message);
    }
}


// edti category
const editcategory = async (req, res) => {
    try {
        const id = req.query.id
        console.log(req.query.id);
        if (id) {

            await Category.updateOne({ _id: id }, {
                $set: {
                    name: req.body.categoryname,
                    description: req.body.description
                }
            })
            console.log(req.body.categoryname);
            res.redirect('/admin/category-list')
        }

    } catch (error) {
        console.log(error.message);
    }
}


// delete category
const deletecategory = async (req, res) => {

    try {
        // console.log('hi');
        const category = req.query.id
        console.log(category);
        const deleted = await Category.deleteOne({ _id: category })

        if (deleted) {
            res.redirect('/admin/category-list')
        } else {
            console.log('404');
        }
    } catch (error) {
        console.log(error.message);
    }
}
// edit image

// const deleteimage = async( req , res )=>{

//     try {

//         const id = req.query.id


//     } catch (error) {
//         console.log(error.message);
//     }
// }

module.exports = {
    formcategory,
    addcategory,
    editcategory,
    showcategory,
    deletecategory,
    updatecategory

    // deleteproduct
}