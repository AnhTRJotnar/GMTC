var express = require('express');
var router = express.Router();
var ProductModel = require('../models/ProductModel');
var CategoryModel = require('../models/CategoryModel');
const { Model } = require('mongoose');
const {checkLoginSession, checkAdminSession, checkCoachSession} = require('../middlewares/auth');


//featur: show all produc
//URL: localhost:3000/Product
router.get('/', checkLoginSession, async (req, res) => {
    var ProductList = await ProductModel.find({}).populate('category');
    res.render('product/index', {ProductList});
});

router.get('/delete/:id', checkLoginSession, checkAdminSession, async (req, res)=> {
    var id= req.params.id;
    await ProductModel.findByIdAndDelete(id);
    res.redirect('/product');
})

router.get('/add', checkLoginSession, checkAdminSession, async (req, res) => {
    var categoryList = await CategoryModel.find({})
    res.render('product/add', { categoryList });
})

router.post('/add', checkLoginSession, checkAdminSession, async (req, res) =>{
    try{
        var product = req.body;
        await ProductModel.create(product);
        res.redirect('/product');
    } catch (err) {
        if (err.name === 'ValidationError') {
            let InputErrors ={};
            for (let field in err.errors) 
                {
                    InputErrors[field] = err.errors[field].message;
                }
                res.render('product/add', { InputErrors, product});
            }
        }
    })

router.get('/edit/:id', checkLoginSession, checkAdminSession, async (req, res) => {
    var id = req.params.id;
    var product = await ProductModel.findById(id);
    res.render('product/edit', { product });
})

router.post('/edit/:id', checkLoginSession, checkAdminSession, async (req, res) => {
    var id = req.params.id;
    var data= req.body;
    await ProductModel.findByIdAndUpdate(id, data);
    res.redirect('/product');
})

router.post('/search', async (req, res) => {
    var kw = req.body.keyword;
    var ProductList = await ProductModel.find({ name: new RegExp(kw, "i") }).populate('category');
    res.render('product/index', { ProductList })
})

router.get('/sort/asc', async (req, res) =>{
    var ProductList = await ProductModel.find().sort({ name: 1 }).populate('category');
    res.render('product/index', { ProductList })
})

router.get('/sort/desc', async (req, res) =>{
    var ProductList = await ProductModel.find().sort({ name: -1 }).populate('category');
    res.render('product/index', { ProductList })
})
module.exports = router;