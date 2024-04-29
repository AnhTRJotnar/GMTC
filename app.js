var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');
var moment = require('moment');
var cron = require('node-cron'); // Import node-cron
const { markCompletedSessions } = require('./public/javascripts/bookingUtil'); // Import the function to mark completed sessions

var app = express();

// Schedule the task to mark completed sessions
cron.schedule('* * * * *', () => { // Runs every hour
  console.log("Running scheduled task to mark completed sessions...");
  markCompletedSessions(); // Execute the function to update session status
});

// Set up routes and middleware
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/member');
var productRouter = require('./routes/product');
var categoryRouter = require('./routes/category');
var authRouter = require('./routes/auth');
var memberRouter = require('./routes/member');
var classRouter = require('./routes/class');
var coachRouter = require('./routes/coach');
var postRouter = require('./routes/post');
var techniqueRouter = require('./routes/technique');
var reportRouter = require('./routes/report');

var session = require('express-session');
const timeout = 1000 * 60 * 60 * 24; // Session timeout configuration
app.use(session({
    secret: "alien_is_existed_or_not_it_is_still_a_secret",
    saveUninitialized: false,
    cookie: { maxAge: timeout },
    resave: false
}));

// Layout configuration
app.use((req, res, next) => {
  switch (req.session.role) {
      case 'admin':
          res.locals.layout = 'adminLayout';
          break;
      case 'coach':
          res.locals.layout = 'coachLayout';
          break;
      default:
          res.locals.layout = 'studentLayout';
          break;
  }
  next();
});

// Configure Mongoose
var mongoose = require('mongoose');
var uri = "mongodb://127.0.0.1:27017/GMTC";
mongoose.connect(uri) 
  .then(() => console.log('Connected to DB'))
  .catch((err) => console.log('Error: ' + err));

// Configure body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// Handlebars helpers
hbs.registerHelper('eq', function (value1, value2) {
  return value1 === value2;
});

hbs.registerHelper('formatDate', function(dateString) {
  return moment(dateString).format('MMMM Do YYYY');
});

hbs.registerHelper('dayName', function(value) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[value];
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/images", express.static('images'));

// Middleware for session variables
app.use((req, res, next) => {
  res.locals.username = req.session.username;
  res.locals.userid = req.session.userid;
  res.locals.role = req.session.role;
  next();
});

// Route handling
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/category', categoryRouter);
app.use('/product', productRouter);
app.use('/auth', authRouter);
app.use('/member', memberRouter);
app.use('/class', classRouter);
app.use('/coach', coachRouter);
app.use('/post', postRouter);
app.use('/technique', techniqueRouter);
app.use('/report', reportRouter);

// Catch 404 and error handling
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
