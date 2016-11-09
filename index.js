var express = require('express'),
    app = express(),
    ejsLayouts = require('express-ejs-layouts'),
    bodyParser = require('body-parser'),
    db = require("./models"),
    port = (3000 || process.env.PORT),
    cloudinary = require('cloudinary');

app.use(express.static('public'));
// var multer  = require('multer')
// var upload = multer({ dest: './uploads/' })

cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUDKEY,
    api_secret: process.env.CLOUDSECRET
});

console.log(process.env.CLOUDNAME);
console.log(process.env.CLOUDKEY);
console.log(process.env.CLOUDSECRET);

app.use(ejsLayouts);  
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));



app.get('/', function(req,res) {
  res.render('index');
});

app.get('/problems', function(req, res) {
  db.problem.findAll().then(function(problems) {
    res.send(problems)
  });
});



app.post('/problems', function(req, res) {
  //post problems to db
  console.log(req.body)


    db.problem.create({
    title: req.body.problemTitle,
    description: req.body.description,
    locationName: req.body.location,
    typeId: req.body.type_id,
    lat: req.body.lat,
    lng: req.body.lng
    // picture: result.url
  }).then(function(data) {
    res.render('index');
  });





});

app.listen(port);

