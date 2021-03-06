var express = require('express');
var router = express.Router();

var mongodb = require('mongodb');

var app = express();

var cookieParser = require('cookie-parser');

var cookieEncrypter = require('cookie-encrypter');
const secretKey = "jklfasd893fyh9yhdhLagniappedl83j";
const cookieParams = {
  httpOnly: true,
  signed: true,
  maxAge: 3000000
}
app.use(cookieParser(secretKey));
app.use(cookieEncrypter(secretKey))

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));


var handlebars = require('express-handlebars').create({
  defaultLayout: 'main'
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars'); //Set the GUI as handlebars
var port = "5000"; //Set the port to be 5000
app.set('port', port);
// Create a directory called public and then a directory named img inside of it
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  var mongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/schoolboard";

  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Couldn't connect to database.");
    } else {
      var collection = db.collection('schools');
      collection.find().limit(4).toArray(function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/')
        } else if (result) {
          result.sort(function (a, b) {
            var x = a.name.toLowerCase();
            var y = b.name.toLowerCase();
            if (x < y) {
              return -1;
            }
            if (x > y) {
              return 1;
            }
            return 0;
          });
          res.render('home', {
            schools: result
          });
        } else {
          console.log(result);
          res.redirect('/')
        }
      })
    }
  })
});

app.get('/signup-login', function (req, res) {
  // Point at the signup-login.handlebars view
  res.clearCookie("username");
  res.render('signup-login');
});

app.get('/signup-login-fail', function (req, res) {
  //Point at the signup-login-fail.handlebars view
  res.render('signup-login-fail');
})

app.get('/admin', function (req, res) {

  if (req.signedCookies.username != "admin") {
    res.redirect('/')
    return false
  }

  var mongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/schoolboard";

  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Couldn't connect to database.");
    } else {
      var collection = db.collection('schools');
      collection.find().toArray(function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/')
        } else if (result) {
          console.log(result[0].name);
          result.sort(function (a, b) {
            var x = a.name.toLowerCase();
            var y = b.name.toLowerCase();
            if (x < y) {
              return -1;
            }
            if (x > y) {
              return 1;
            }
            return 0;
          });
          res.render('admincontrols', {
            schools: result
          });
        } else {
          console.log(result);
          res.redirect('/')
        }
      })
    }
  })
});

//FOR ADMIN ONLY

app.get('/school/add', function (req, res) {
  // Point at the signup-login.handlebars view
  res.render('addschool');
});

app.post('/addschool', function (req, res) {
  // Point at the signup-student.handlebars view
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/schoolboard';
  MongoClient.connect(url, function (err, db) { // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var collection = db.collection('schools'); // Get the documents collection
      var school = {
        name: req.body.name,
        location: req.body.location,
        desc: req.body.desc, // Get the student data    	city: req.body.city, state: req.body.state, sex: req.body.sex,
        posts: [],
        followers: [],
        website: req.body.website,
        path: req.body.pathname,
        imgURL: req.body.imgURL,
        needsApproval: []
      };
      collection.insert([school], function (err, result) { // Insert the student data
        if (err) {
          console.log(err);
        } else {
          res.redirect("/"); // Redirect to home
        }
      });
    }
  });
});


app.post('/updateschool', function (req, res) {
  path = req.body.school;
  res.redirect('/updateschool/' + path)
});

app.get('/updateschool/:school', function (req, res) {
  var mongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/schoolboard";

  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Couldn't connect to database.");
    } else {
      var collection = db.collection('schools');
      console.log(req.params.school);
      collection.findOne({
        "path": req.params.school,
      }, function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/')
        } else if (result) {
          res.render('updateschool', {
            school: result,
          });
        } else {
          console.log(result);
          res.redirect('/')
        }
      })
    }
  })
});

app.post('/schoolupdated', function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/schoolboard';
  MongoClient.connect(url, function (err, db) { // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var collection = db.collection('schools'); // Get the documents collection
      console.log(req.body.name);
      var olddata1 = {
        'name': req.body.name
      }
      var school1 = {
        $set: {
          location: req.body.location, // Get the school data    	city: req.body.city, state: req.body.state, sex: req.body.sex,
          desc: req.body.desc,
          website: req.body.website,
          imgURL: req.body.imgURL
        }
      };
      collection.update(olddata1, school1, function (err, result) { // Updates the school data
        if (err) {
          console.log(err);
        } else {
          console.log('end');
          res.redirect("/admin"); // Redirect to your account
        }
      });
    }
  });
});


app.post('/gotoschool', function (req, res) {
  path = req.body.school;
  res.redirect('/school/' + path)
});


//SIGNUP PAGES
app.get('/signup/student', function (req, res) {
  // Point at the signup-student.handlebars view
  res.render('signup-student');
});

app.get('/signup/student-fail', function (req, res) {
  //Point at the signup-student-fail.handlebars.view
  res.render('signup-student-fail');
})

app.get('/signup/rep', function (req, res) {
  // Point at the signup-rep.handlebars view
  // Point at the signup-ambassador.handlebars view
  var mongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/schoolboard";

  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Couldn't connect to database.");
    } else {
      var collection = db.collection('schools');
      collection.find().toArray(function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/signup-login')
        } else if (result) {
          console.log(result[0].name);
          res.render('signup-rep', {
            schools: result
          });
        } else {
          console.log(result);
          res.redirect('/signup-login')
        }
      })
    }
  })
});

app.get('/signup/rep-fail', function (req, res) {
  // Point at the signup-rep.handlebars view
  // Point at the signup-ambassador.handlebars view
  var mongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/schoolboard";

  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Couldn't connect to database.");
    } else {
      var collection = db.collection('schools');
      collection.find().toArray(function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/signup-login')
        } else if (result) {
          console.log(result[0].name);
          res.render('signup-rep-fail', {
            schools: result
          });
        } else {
          console.log(result);
          res.redirect('/signup-login')
        }
      })
    }
  })
});

app.get('/signup/ambassador', function (req, res) {
  // Point at the signup-ambassador.handlebars view
  var mongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/schoolboard";

  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Couldn't connect to database.");
    } else {
      var collection = db.collection('schools');
      collection.find().toArray(function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/signup-login')
        } else if (result) {
          console.log(result[0].name);
          res.render('signup-ambassador', {
            schools: result
          });
        } else {
          console.log(result);
          res.redirect('/signup-login')
        }
      })
    }
  })
});

app.get('/signup/ambassador-fail', function (req, res) {
  // Point at the signup-ambassador.handlebars view
  var mongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/schoolboard";

  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Couldn't connect to database.");
    } else {
      var collection = db.collection('schools');
      collection.find().toArray(function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/signup-login')
        } else if (result) {
          console.log(result[0].name);
          res.render('signup-ambassador-fail', {
            schools: result
          });
        } else {
          console.log(result);
          res.redirect('/signup-login')
        }
      })
    }
  })
});

//MYACCOUNT

//main
app.get('/myaccount', function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/schoolboard';
  MongoClient.connect(url, function (err, db) { // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var username = req.signedCookies.username;
      var collection = db.collection('login');
      collection.find({
        "username": username,
      }).toArray(function (err, result) {
        if (err) {
          console.log(err);
        } else if (result.length) {
          //set COOKIE
          if (result[0].type == "ambassador") {
            res.redirect("/myaccount/ambassador"); // Redirect to the updated student list
          } else if (result[0].type == "student") {
            res.redirect("/myaccount/student");
          } else if (result[0].type == "rep") {
            res.redirect("/myaccount/rep");
          } else {
            console.log('account type not set')
            res.redirect('signup-login');
          }
        } else {
          console.log(result);
          res.render('signup-login-noaccount')
        }
        db.close();
      });
    }
  });
});


//student
app.get('/myaccount/student', function (req, res) {
  console.log('in student');

  var mongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/schoolboard";

  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Couldn't connect to database.");
    } else {
      var username = req.signedCookies.username;
      var collection = db.collection('login');
      collection.findOne({
        "username": username,
      }, function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/signup-login')
        } else if (result) {
          console.log(result.name);
          res.render('myaccount-student', {
            student: result
          });
        } else {
          console.log(result);
          res.redirect('/signup-login')
        }
      })
    }
  })
});

//ambassador
app.get('/myaccount/ambassador', function (req, res) {
  var mongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/schoolboard";

  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Couldn't connect to database.");
    } else {
      var username = req.signedCookies.username;
      var collection = db.collection('login');
      collection.findOne({
        "username": username,
      }, function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/signup-login')
        } else if (result) {
          console.log(result.name);
          res.render('myaccount-ambassador', {
            ambassador: result
          });
        } else {
          console.log(result);
          res.redirect('/signup-login')
        }
      })
    }
  })
});

//representative
app.get('/myaccount/rep', function (req, res) {

  var mongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/schoolboard";

  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Couldn't connect to database.");
    } else {
      var username = req.signedCookies.username;
      var collection = db.collection('login');
      collection.findOne({
        "username": username,
      }, function (err, result) {
        var collection = db.collection('schools');
        collection.findOne({
          "name": result.school,
        }, function (err, resultschool) {
          if (err) {
            console.log("error");
            res.redirect('/signup-login')
          } else if (resultschool) {
            console.log('hello');
            console.log(resultschool);
            recentpost = resultschool.needsApproval[0];
            res.render('myaccount-rep', {
              rep: result,
              posts: recentpost
            });
          } else {
            console.log(result);
            res.redirect('/signup-login')
          }
          db.close();
        });
      })
    }
  });
});

//LOGIN PAGE
app.post('/authenticateuser', function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/schoolboard';
  MongoClient.connect(url, function (err, db) { // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var username = req.body.username;
      var pass = req.body.pass;
      var collection = db.collection('login');
      collection.find({
        "username": username,
        "password": pass,
      }).toArray(function (err, result) {
        if (err) {
          console.log(err);
        } else if (result.length) {
          //set COOKIE
          res.cookie("username", username, cookieParams);
          if (result[0].type == "ambassador") {
            res.redirect("/myaccount/ambassador"); // Redirect to the updated student list
          } else if (result[0].type == "student") {
            res.redirect("/myaccount/student");
          } else if (result[0].type == "rep") {
            res.redirect("/myaccount/rep");
          } else {
            console.log('account type not set')
            res.redirect('signup-login');
          }
        } else {
          if ((username === "admin") && (pass === "admin")) {
            res.cookie("username", username, cookieParams);
            res.redirect("admin")
          } else {
            console.log(result);
            res.redirect('signup-login-fail');
          }
        }
        db.close();
      });
    }
  });
});


//LOGOUT
app.post('/logout', function (req, res) {
  res.clearCookie("username");
  res.redirect('/signup-login')
});

//REGISTRATION

//student
app.post('/addstudent', function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/schoolboard';
  MongoClient.connect(url, function (err, db) { // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var collection = db.collection('login'); // Get the documents collection
      collection.findOne({
        "username": req.body.Name
      }, function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/signup-student')
        } else if (result) {
          console.log(result.name);
          console.log('username is taken');
          res.redirect('/signup/student-fail');
        } else {
          console.log('username works');
          var student1 = {
            name: req.body.Name,
            HSyear: req.body.HSYear, // Get the student data    	city: req.body.city, state: req.body.state, sex: req.body.sex,
            HighSchool: req.body.HighSchool,
            admissionYear: req.body.admissionYear,
            email: req.body.Email,
            username: req.body.Username,
            password: req.body.Password,
            schoolsFollowing: [],
            type: "student"
          };
          collection.insert([student1], function (err, result) { // Insert the student data
            if (err) {
              console.log(err);
            } else {
              res.redirect("/"); // Redirect to home
            }
          });      
        }
      });
    }
  });
});

//ambassador
app.post('/addambassador', function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/schoolboard';
  MongoClient.connect(url, function (err, db) { // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var collection = db.collection('login'); // Get the documents collection
      collection.findOne({
        "username": req.body.Name
      }, function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/signup-ambassador')
        } else if (result) {
          console.log(result.name);
          console.log('username is taken');
          res.redirect('/signup/ambassador-fail');
        } else {
          console.log('username works');
          var ambassador1 = {
            name: req.body.Name,
            school: req.body.school,
            gradYear: req.body.gradYear, // Get the student data    	city: req.body.city, state: req.body.state, sex: req.body.sex,
            year: req.body.year,
            major: req.body.major,
            email: req.body.Email,
            bio: req.body.Bio,
            username: req.body.Username,
            password: req.body.Password,
            type: "ambassador"
          };
          collection.insert([ambassador1], function (err, result) { // Insert the student data
            if (err) {
              console.log(err);
            } else {
              res.redirect("/"); // Redirect to home
            }
          });
        }
      })
    }
  });
});

//rep
app.post('/addrep', function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/schoolboard';
  MongoClient.connect(url, function (err, db) { // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var collection = db.collection('login'); // Get the documents collection
      collection.findOne({
        "username": req.body.Name
      }, function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/signup-rep')
        } else if (result) {
          console.log(result.name);
          console.log('username is taken');
          res.redirect('/signup/rep-fail');
        } else {
          console.log('username works');
          var rep1 = {
            name: req.body.Name,
            school: req.body.school,
            role: req.body.Role, // Get the student data    	city: req.body.city, state: req.body.state, sex: req.body.sex,
            email: req.body.Email,
            bio: req.body.Bio,
            username: req.body.Username,
            password: req.body.Password,
            type: "rep"
          };
          collection.insert([rep1], function (err, result) { // Insert the student data
            if (err) {
              console.log(err);
            } else {
              res.redirect("/"); // Redirect to home
            }
          });
        }
      })
    }
  });
});

//UPDATE

//students
app.post('/updatestudent', function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/schoolboard';
  MongoClient.connect(url, function (err, db) { // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var collection = db.collection('login'); // Get the documents collection
      var olddata = {
        'username': req.signedCookies.username
      }
      var student1 = {
        $set: {
          name: req.body.Name,
          HSyear: req.body.HSYear, // Get the student data    	city: req.body.city, state: req.body.state, sex: req.body.sex,
          HighSchool: req.body.HighSchool,
          admissionYear: req.body.admissionYear,
          email: req.body.Email,
          type: "student"
        }
      };
      collection.update(olddata, student1, function (err, result) { // Updates the student data
        if (err) {
          console.log(err);
        } else {
          res.redirect("/myaccount/student"); // Redirect to your account
        }
      });
    }
  });
});

//ambassador
app.post('/updateambassador', function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/schoolboard';
  MongoClient.connect(url, function (err, db) { // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var collection = db.collection('login'); // Get the documents collection
      var olddata = {
        'username': req.signedCookies.username
      }
      var ambassador1 = {
        $set: {
          name: req.body.Name,
          gradYear: req.body.gradYear, // Get the student data    	city: req.body.city, state: req.body.state, sex: req.body.sex,
          year: req.body.year,
          major: req.body.major,
          email: req.body.Email,
          bio: req.body.Bio
        }
      };
      collection.update(olddata, ambassador1, function (err, result) { // Updates the student data
        if (err) {
          console.log(err);
        } else {
          res.redirect("/myaccount/ambassador"); // Redirect to your account
        }
      });
    }
  });
});

//rep
app.post('/updaterep', function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/schoolboard';
  MongoClient.connect(url, function (err, db) { // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var collection = db.collection('login'); // Get the documents collection
      var olddata = {
        'username': req.signedCookies.username
      }
      var rep1 = {
        $set: {
          name: req.body.Name,
          role: req.body.Role, // Get the student data    	city: req.body.city, state: req.body.state, sex: req.body.sex,
          email: req.body.Email,
          bio: req.body.Bio
        }
      };
      collection.update(olddata, rep1, function (err, result) { // Updates the student data
        if (err) {
          console.log(err);
        } else {
          res.redirect("/myaccount/rep"); // Redirect to your account
        }
      });
    }
  });
});

//--POSTS--

//TODO
//ambassador submit post for approval
app.post('/submitforapproval', function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/schoolboard';
  MongoClient.connect(url, function (err, db) { // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var collection = db.collection('schools'); // Get the documents collection
      var data = {
        'name': req.body.School
      };
      var post1 = {
        $push: {
          needsApproval: {
            "title": req.body.Title,
            "author": req.body.author,
            "content": req.body.content,
            "username": req.body.username
          }
        }
      };
      collection.update(data, post1, function (err, result) { // Updates the student data
        if (err) {
          console.log(err);
        } else {
          console.log('posted data to document')
          res.redirect("/myaccount/ambassador"); // Redirect to your account
        }
      });
    }
  });
});

//ambassador submit post for approval
app.post('/approvepost', function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/schoolboard';
  MongoClient.connect(url, function (err, db) { // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var collection = db.collection('schools'); // Get the documents collection
      var data = {
        'name': req.body.School
      };
      var post1 = {
        $push: {
          posts: {
            "title": req.body.Title,
            "author": req.body.Author,
            "content": req.body.Content,
            "username": req.body.username
          }
        }
      };
      var removepost = {
        $pull: {
          needsApproval: {
            "title": req.body.Title,
          }
        }
      };
      collection.update(data, post1, function (err, result) { // Updates the student data
        if (err) {
          console.log(err);
        } else {
          collection.update(data, removepost, function (err2, result2) {
            if (err2) {
              console.log(err2)
            } else {
              console.log('Post approved!')
              res.redirect("/myaccount/rep"); // Redirect to your account
            }
          })
        }
      });
    }
  });
});


//rep approve post


//--SCHOOLS--
app.get('/school/:school', function (req, res) {
  var mongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/schoolboard";

  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Couldn't connect to database.");
    } else {
      var collection = db.collection('schools');
      console.log(req.params.school);
      collection.findOne({
        "path": req.params.school,
      }, function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/')
        } else if (result) {
          res.render('school', {
            school: result,
          });
        } else {
          console.log(result);
          res.redirect('/')
        }
      })
    }
  })
});

//--FOLLOWING
app.post('/followschool', function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/schoolboard';
  MongoClient.connect(url, function (err, db) { // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var collection = db.collection('login'); // Get the documents collection
      var collection2 = db.collection('schools');
      collection.findOne({
        'username': req.signedCookies.username,
        'schoolsFollowing': {
          $elemMatch: {
            'name': req.body.School
          }
        }
      }, function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/')
        } else if (result) {
          console.log('already following');
          res.redirect('/myaccount/student');
        } else {
          console.log('not following');
          var data = {
            'username': req.signedCookies.username
          };
          var data2 = {
            'name': req.body.School
          }
          console.log('33' + req.body.School);
          var post1 = {
            $push: {
              schoolsFollowing: {
                name: req.body.School,
                path: req.body.path
              }
            }
          }
          collection.update(data, post1, function (err, result) { // Updates the student data
            if (err) {
              console.log(err);
            } else {
              console.log('followed school')
            }
          });
          var post2 = {
            $push: {
              followers: {
                name: req.signedCookies.username
              }
            }
          }
          collection2.update(data2, post2, function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log('follower added to school')
              res.redirect(req.get('referer'));
            }
          })
        }
      })
    }
  });
});

app.post('/unfollowschool', function (req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/schoolboard';
  MongoClient.connect(url, function (err, db) { // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var collection = db.collection('login'); // Get the documents collection
      var data = {
        'name': req.body.StudentName
      };
      var removepost = {
        $pull: {
          schoolsFollowing: {
            "name": req.body.SchoolFollowing,
          }
        }
      };
      console.log('Student: ' + req.body.StudentName);
      console.log('School To Remove: ' + req.body.SchoolFollowing);
      collection.update(data, removepost, function (err2, result2) {
        if (err2) {
          console.log(err2)
        } else {
          console.log('School Removed')
          res.redirect(req.get('referer')) // Redirect to your account
        }
      });
    }
  });
});



//--SEARCH--
app.post('/search', function (req, res) {
  var input = req.body.Search;
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/schoolboard';
  MongoClient.connect(url, function (err, db) { // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var collection = db.collection('schools');
      collection.createIndex({
        name: "text",
        location: "text"
      });
      var searchinput = {
        $text: {
          $search: input
        }
      };
      collection.find(searchinput).toArray(function (err, result) { // Updates the student data
        if (err) {
          console.log(err);
        } else if (result.length > 0) {
          console.log('there are results');
          res.render("search", {
            schools : result
          }
        ); // Redirect to your account
        } else {
          console.log('no results');
          res.redirect("no-results");
        }
      });
    }
  });
});

app.get('/no-results', function (req, res){
  //Point at the no-results.handlebars view
  var mongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/schoolboard";

  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Couldn't connect to database.");
    } else {
      var collection = db.collection('schools');
      collection.find().toArray(function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/')
        } else if (result) {
          result.sort(function (a, b) {
            var x = a.name.toLowerCase();
            var y = b.name.toLowerCase();
            if (x < y) {
              return -1;
            }
            if (x > y) {
              return 1;
            }
            return 0;
          });
          res.render('no-results', {
            schools: result
          });
        } else {
          console.log(result);
          res.redirect('/')
        }
      })
    }
  })
});

//--PROFILES--
app.get('/ambassadors/:user', function (req, res) {
  var mongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/schoolboard";

  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Couldn't connect to database.");
    } else {
      var username = req.params.user;
      var collection = db.collection('login');
      collection.findOne({
        "username": username,
      }, function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/')
        } else if (result) {
          console.log('username:'+ result.username);
          res.render('profile-ambassador', {
            ambassador: result
          });
        } else {
          console.log(result);
          res.redirect('/')
        }
      })
    }
  })
});

app.get('/reps/:user', function (req, res) {
  var mongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/schoolboard";

  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Couldn't connect to database.");
    } else {
      var username = req.params.user;
      var collection = db.collection('login');
      collection.findOne({
        "username": username,
      }, function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/')
        } else if (result) {
          console.log(result.name);
          res.render('profile-rep', {
            rep: result
          });
        } else {
          console.log(result);
          res.redirect('/')
        }
      })
    }
  })
});

app.get('/students/:user', function (req, res) {
  var mongoClient = mongodb.MongoClient;

  var url = "mongodb://localhost:27017/schoolboard";

  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Couldn't connect to database.");
    } else {
      var username = req.params.user;
      var collection = db.collection('login');
      collection.findOne({
        "username": username,
      }, function (err, result) {
        if (err) {
          console.log("error");
          res.redirect('/')
        } else if (result) {
          console.log(result.name);
          res.render('profile-student', {
            student: result
          });
        } else {
          console.log(result);
          res.redirect('/')
        }
      })
    }
  })
});

//--ERRORS--

//404
app.use(function (req, res) {
  // Define the content type
  res.type('text/html');
  // The default status is 200
  res.status(404);
  // Point at the 404.handlebars view
  res.render('404');
});

//500
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  // Point at the 500.handlebars view
  res.render('500');
});

//Dynamicizes the webpage
app.listen(app.get('port'), function () {
  console.log('Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate');
});

module.exports = router;