var express = require('express');
var router = express.Router();
var CategoryModel = require('../models/CategoryModel');
const {checkLoginSession, checkAdminSession, checkCoachSession} = require('../middlewares/auth');

//feature: show all categories
//URL: localhost:3000/category
router.get('/', async (req, res) => {
    var categoryList = await CategoryModel.find({});
    res.render('category/index', { categoryList });
});

router.get('/delete/:id',  checkLoginSession, checkAdminSession, async (req, res)=> {
    var id= req.params.id;
    await CategoryModel.findByIdAndDelete(id);
    res.redirect('/category');
})

router.get('/add', checkLoginSession, checkAdminSession, async(req, res) => {
    res.render('category/add');
})

router.post('/add', checkLoginSession, checkAdminSession, async (req, res) =>{
    var category = req.body;
    await CategoryModel.create(category);
    res.redirect('/category');
})

router.get('/edit/:id', checkLoginSession, checkAdminSession, async (req, res) => {
    var id = req.params.id
    var category = await CategoryModel.findById(id);
    res.render('category/edit', { category });
})

router.post('/edit/:id', checkLoginSession, checkAdminSession, async (req, res) => {
    var id = req.params.id;
    var data= req.body;
    await CategoryModel.findByIdAndUpdate(id, data);
    res.redirect('/category');
})
module.exports = router;