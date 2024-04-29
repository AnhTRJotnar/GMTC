var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/admin', (req, res) => {
  res.render('admin')
});

router.get('/coach', (req, res) => {
  res.render('coach')
});


module.exports = router;
