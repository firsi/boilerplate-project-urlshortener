'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require('dns');

var cors = require('cors');

var app = express();

var MongoClient = require('mongodb').MongoClient;

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
process.env.MONGOLAB_URI = "mongodb+srv://firsi:jeNLrdjaimgthaEu@cluster0-tjplu.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true });
var Schema = mongoose.Schema;
var urlSchema = new Schema({original_url: String, short_url: String});
var Url = mongoose.model('Url', urlSchema);



app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended:false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
  
  
  
});

  app.post('/api/shorturl/new', (req, res) => {
    const REGEX = /^https?:\/\//i
    const posted_url = req.body.url;
    const clean_url = posted_url.replace(REGEX, '');
    
    dns.lookup(clean_url, (error, address) => {      
      //if the address is valid then we check if it exists in the database
      if(error === null && REGEX.test(posted_url)){
             
              Url.findOne({original_url: posted_url})
               .select('-_id')           
                .exec((error, url) => {
                if(error)return console.log(error);
                 
                
                //if url doesn't exist update the database
                    if(url === null ){
                      var short_url = parseInt(Math.random()*1000);
                      
                      Url.create({original_url: posted_url, short_url: short_url}, (error, data) => {
                            if(error) return console.log(error);
                            res.json(data);
                        });
                    }
                    else{
                      res.json(url);
                    }
              });
              
              
      }
      else{
        res.json({"error": "invalid"});
      }
    })
  });

//Redirection handling


app.get("/api/shorturl/:short_url", (req,res) => {
          Url.findOne({short_url: req.params.short_url}, (error, url) => {
                      if(url === null){
                        res.json({error:"No short url found for your given input"})
                      }
                      else{
                        res.redirect(url.original_url);
                      }
          }) ; 
        
} );



app.listen(port, function () {
  console.log('Node.js listening ...');
});