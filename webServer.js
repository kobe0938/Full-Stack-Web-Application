/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');

const fs = require("fs");

const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

var express = require('express');
var app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if(request.session.user_id === undefined) {
        response.status(401).send("User is not logged in.");
        return;
    }
    User.find({}, (error, Users) => {
        let usersCopy = Users;
        async.eachOf(Users, 
            (curUser, i, callback) => {
                let {_id, first_name, last_name} = curUser;
                usersCopy[i] = {_id, first_name, last_name};
                callback();
            }, (error2) => {
                if (error2) {
                    console.log(error2);
                } else {
                    response.status(200).send(usersCopy);
                }
            }
        );
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if(request.session.user_id === undefined) {
        response.status(401).send("User is not logged in.");
        return;
    }
    var id = request.params.id;
    User.findOne({_id: id}, (error, curUser) => {
        if (error) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        let {_id, first_name, last_name, location, description, occupation, mentioned} = curUser;
        let usersCopy = {_id, first_name, last_name, location, description, occupation, mentioned};
        response.status(200).send(usersCopy);
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get("/photosOfUser/:id", function(request, response) {
    if(!request.session.user_id) {
        response.status(401).send("User is not logged in.");
    } else {
        var id = request.params.id;
        Photo.find({ user_id: id }, (err1, photos) => {
          if (err1) {
            console.log("Cannot find photo" + id);
            response.status(400).send("Not found");
            return;
          }
          let newlyCreatedPhotos = JSON.parse(JSON.stringify(photos));
          async.eachOf(
            newlyCreatedPhotos,
            function(photo, i, callback1) {
              delete photo.__v;
              async.eachOf(
                photo.comments,
                function(com, j, callback2) {
                  let the_user = User.findOne({ _id: com.user_id }, err2 => {
                    if (err2) {
                      response.status(400).send("Can not found.");
                    }
                  }).clone().catch(function(err2){ console.log(err2);});
                  the_user.then(user => {
                    let { _id, first_name, last_name } = user;
                    photo.comments[j] = {
                      comment: com.comment,
                      date_time: com.date_time,
                      _id: com._id,
                      user: {
                        _id: _id,
                        first_name: first_name,
                        last_name: last_name
                      }
                    };
                    callback2();
                  });
                },
                (err3) => {
                  if (err3) {
                    console.log("Can not load comments.");
                  }
                  newlyCreatedPhotos[i] = photo;
                  callback1();
                }
              );
            },
            (err4) => {
              if (!err4) {
                response.status(200).send(newlyCreatedPhotos);
              }
            }
          );
        });
    }
  });
// app.get('/photosOfUser/:id', function (request, response) {
//     if(request.session.user_id === undefined) {
//         response.status(401).send("User is not logged in.");
//         return;
//     }
//     var id = request.params.id;
//     Photo.find({user_id : id}, (error, photos) => {
//         if (error) {
//             console.log('Photos for user with _id:' + id + ' not found.');
//             response.status(400).send('Not found');
//             return;
//         }
//         let photosCopy = JSON.parse(JSON.stringify(photos));
//         async.eachOf(photosCopy, 
//             (photo, i, callback) => {
//                 async.eachOf(photo.comments, (com, j, callbackComment) => {
//                     let userOfComment = User.findOne({_id: com.user_id}, (error2) => {
//                         if (error2) {
//                             console.log('Commenting User with _id:' + com.user_id + ' not found.');
//                             response.status(400).send('Not found');
//                         }
//                     }).clone().catch(function(error3){ 
//                         console.log(error3);
//                     });
//                     userOfComment.then((user) => {
//                         let {_id, first_name, last_name} = user;
//                         photo.comments[j] = {
//                             comment: com.comment,
//                             date_time: com.date_time,
//                             _id: com._id,
//                             user: {
//                                 _id: _id,
//                                 first_name: first_name,
//                                 last_name: last_name
//                             }
//                         };
//                         callbackComment();
//                     }).catch((error4) => {
//                         console.log(error4.response);
//                     });
//                 }, (error5) => {
//                     if (error5) {
//                         console.log('Comment not found.');
//                         response.status(400).send('Not found');
//                         return;
//                     }
//                     let {_id, file_name, date_time, user_id, comments} = photo;
//                     photosCopy[i] = {_id, file_name, date_time, user_id, comments};
//                     callback();
//                 });
//             }, (error6) => {
//                 if (error6) {
//                     console.log('Photo not found.');
//                     response.status(400).send('Not found');
//                 } else {
//                     response.status(200).send(photosCopy);
//                 }               
//             }
//         );
//     });
// });

app.post('/admin/login', (request, response) => {
    let login_name_from_text_field = request.body.login_name;
    let password_from_text_field = request.body.password;

    User.findOne({login_name: login_name_from_text_field}, (error, user) => {
        if (error || !user) {
            console.log("Can not find user: " + login_name_from_text_field + " in the database!");
            response.status(400).send("Bad request: can not find user");
        } else if (user.password !== password_from_text_field) {
            console.log("Password not correct!");
            response.status(400).send("Bad request: Password not correct!");
        } else if (user.password === password_from_text_field) {
            request.session.login_name = login_name_from_text_field;
            request.session.user_id = user._id;
            request.session.cookie.resave = true;
            let {_id, first_name, last_name, login_name} = user;
            let curUser = {_id, first_name, last_name, login_name};
            response.status(200).send(curUser);
        }
    });
});

app.post('/admin/logout', (request, response) => {
    request.session.destroy((error) => {
        if (error) {
            console.log("Cannot log out.");
            response.status(400).send("Cannot log out");
        } else {
            response.status(200).send();
        }
    });
});

app.post('/user', (request, response) => {
    let {login_name, password, first_name, last_name, occupation, location, description} = request.body;
    if (first_name === undefined) {
        response.status(400).send("First name is required.");
    }else if (last_name === undefined) {
        response.status(400).send("Last name is required.");
    }else if (password === undefined) {
        response.status(400).send("Password is required.");
    } else {
        User.findOne({login_name}, (error, user) => {
            // improve later
            if (error) {
                console.log("Error: User: " + login_name + " already exists in the database!");
                response.status(400).send("Error: User: " + login_name + " already exists in the database!");
            } else if (user !== null) {
                console.log("User: " + login_name + " already exists in the database!");
                console.log(user);
                response.status(400).send("User: " + login_name + " already exists in the database!");
            } else {
                User.create({login_name, password, first_name, last_name, occupation, location, description}, (error1, newUser) => {
                    if (error1) {
                        console.log("Register failed.");
                        response.status(400).send("Register failed.");
                    } else {
                        request.session.login_name = login_name;
                        request.session.user_id = newUser._id;
                        let new_user = {_id: newUser._id, first_name, last_name, login_name};
                        response.status(200).send(new_user);
                    }
                });
            }
        });
    }
});

app.post("/commentsOfPhoto/:photo_id", function(request, response) {
    if (!request.session.user_id) {
      response.status(401).send("User is not logged in.");
      return;
    }
    if (!request.body.comment) {
      response.status(400).send("The request.body.comment is not valid.");
      return;
    }
    Photo.findOne({ _id: request.params.photo_id }, function(err, photo) {
      if (err) {
        response.status(400).send("The id is not valid.");
        return;
      }
      let now = new Date();
      photo.comments = photo.comments.concat([
        { comment: request.body.comment, date_time: now, user_id: request.session.user_id }
      ]);
      photo.save();
  
      async.each(
        request.body.mentionsToAdd,
        function(user, callback) {
          User.findOne({ _id: user }, function(err2, user2) {
            if (err2) {
              response.status(400).send("The id is not valid.");
              return;
            }
            user2.mentioned.push(request.params.photo_id);
            user2.save();
            callback();
          });
        },
        function(err3) {
          //after everything is done.
          if (err3) {
            response.status(400).send("Can not load comments");
            return;
          }
          response.status(200).send();
        }
      );
    }).clone().catch(function(err4){ console.log(err4);});
  });

// app.post('/commentsOfPhoto/:photo_id', (request, response) => {
//     if(!request.session.user_id) {
//         response.status(401).send("User is not logged in.");
//     } else {
//         if (!request.body.comment) {
//             response.status(400).send("Invalid or empty comment!");
//             return;
//         } 
//         Photo.findOne({_id: request.params.photo_id}, (error, photo) => {
//             if (error) {
//                 response.status(400).send("Cannot find photo");
//             } else {
//                 photo.comments = photo.comments.concat([{comment: request.body.comment, date_time: new Date(), user_id: request.session.user_id}]);
//                 photo.save();

//                 async.each(
//                     request.body.mentionsToAdd,
//                     function(user, callback) {
//                       User.findOne({ _id: user }, function(err, user) {
//                         if (err) {
//                           response.status(400).send("Invalid id received.");
//                           return;
//                         }
//                         user.mentioned.push(photo_id);
//                         user.save();
//                         callback();
//                       });
//                     },
//                     function(err) {
//                       //after everything is done.
//                       if (err) {
//                         response.status(400).send("something went wrong");
//                         return;
//                       }
//                       response.status(200).send();
//                     }
//                   );
//                 response.status(200).send();
//             }
//         });
//     }
// });


app.post("/photos/new", function(request, response) {
    if (!request.session.user_id) {
      response.status(401).send("User is not logged in.");
      return;
    }
    // console.log(request);
    processFormBody(request, response, function(err) {
      if (err || !request.file) {
        response.status(400).send("request.file is not valid");
        return;
      }
      var timestamp = new Date().valueOf();
      var filename = "U" + String(timestamp) + request.file.originalname;
  
      fs.writeFile("./images/" + filename, request.file.buffer, function(err2) {
        if (err2) {
          response.status(400).send("Can not upload photo.");
          return;
        }
        let users_permitted = Object.entries(JSON.parse(request.body.usersPermissed)).filter((key_value) => key_value[1]).map((key_value) => key_value[0]);
        users_permitted.push(request.session.user_id);
        Photo.create(
          {
            file_name: filename,
            date_time: timestamp,
            user_id: request.session.user_id,
            comments: [],
            tags: [],
            users_permitted,
          },
          function(error, newPhoto) {
            if (error) {
              response.status(400).send("Can not upload photo.");
              return;
            }
            newPhoto.save();
            response.status(200).send();
          }
        );
      });
    });
  });

// app.post('/photos/new', (request, response) => {
//     if(!request.session.user_id) {
//         response.status(401).send("User is not logged in.");
//     } else {
//         processFormBody(request, response, (error) => {
//             if (error || !request.file) {
//                 response.status(400).send("The file is invaild.");
//             } else {
//                 let userPermissions = JSON.parse(request.body.usersPermissed);


//                 const timestamp = new Date().valueOf();
//                 const filename = 'U' +  String(timestamp) + request.file.originalname;
        
//                 fs.writeFile("./images/" + filename, request.file.buffer, (error2) => {
//                     if (error2) {
//                         response.status(400).send("Cannot write file.");
//                     } else {
//                         let users_permitted = Object.entries(userPermissions)
//         .filter((key_value) => key_value[1])
//         .map((key_value) => key_value[0]);
//       users_permitted.push(request.session.user_id);
//                         Photo.create({file_name: filename, date_time: timestamp, user_id: request.session.user_id, comments: [], users_permitted}, (error3, photo) => {
//                             if (error3) {
//                                 response.status(400).send("Can not upload photo.");
//                             } else {
//                                 photo.save();
//                                 response.status(200).send();
//                             }
//                         });
//                     }
//                 });
//             }
//         });
//     }
// });












app.get("/exUsers/list", function(request, response) {
    if (!request.session.user_id) {
      response.status(401).send("User is not logged in.");
      return;
    }
  
    User.find({}, (_, allUsers) => {
      let newlyCreatedUser = allUsers.filter((user) => String(user._id) !== String(request.session.user_id));
      
      async.eachOf(
        newlyCreatedUser, 
        function(user, i, callback) {
          let { _id, first_name, last_name } = user;
          newlyCreatedUser[i] = { _id, first_name, last_name };
          callback();
        },
        (error) => {
          if (error) {
            console.log(error);
          } else {
            response.status(200).send(newlyCreatedUser);
          }
        }
      );
    });
  });

  app.get("/qwe", function(request, response) {
    if (!request.session.user_id) {
      response.status(401).send("User is not logged in.");
      return;
    }
    console.log("here in the mentionOptions");
    User.find({}, (_, allUsers) => {
      let newlyCreatedUser = allUsers;
      console.log(allUsers);
      async.eachOf(
        allUsers,
        function(user, i, callback1) {
          let { _id, first_name, last_name } = user;
          newlyCreatedUser[i] = { id: _id, display:`${first_name} ${last_name}` };
          callback1();
        },
        (error) => {
          if (error) {
            console.log(error);
          } else {
            response.status(200).send(newlyCreatedUser);
          }
        }
      );
    });
  });

  app.get("/admin/current", function(request, response) {
    if (!request.session.user_id) {
      console.log("user_id is undefined");
      response.status(200).send(undefined);
      return;
    }
    User.findOne({ _id: request.session.user_id }, (_, user) => {
      if (!user) {
        console.log("user is undefined");
        response.status(400).send("user is undefined");
        return;
      }
      let { _id, first_name, last_name, login_name } = user;
      let newlyCreatedUser = { _id, first_name, last_name, login_name };
      response.status(200).send(newlyCreatedUser);
    }).clone().catch(function(error){ console.log(error);});
  });

  app.get("/photo/:photo_id", function(request, response) {
    if (!request.session.user_id) {
      response.status(401).send("User is not logged in.");
      return;
    }
    Photo.findOne({ _id: request.params.photo_id }, function(error, photo) {
      if (error) {
        response.status(400).send("photo id is undefined.");
        return;
      }
      User.findOne({ _id: photo.user_id }, function(_, photoOwner) {
        let photoObject = {
          _id: request.params.photo_id,
          photo_owner_id: photoOwner._id,
          file_name: photo.file_name,
          photo_owner_first_name: photoOwner.first_name,
          photo_owner_last_name: photoOwner.last_name
        };
        response.status(200).send(photoObject);
      });
    }).clone().catch(function(error){ console.log(error);});
  });

  app.post(`/addToFavorites`, function(request, response) {
    if (!request.session.user_id) {
      response.status(401).send("User is not logged in.");
      return;
    }
    let photo_id = request.body.photo_id;
    User.findOne({ _id: request.session.user_id }, (error, user) => {
      if (error) {
        response.status(400).send("invalid user id");
        return;
      }
      if (!user.favorites.includes(photo_id)) {
        user.favorites.push(photo_id);
        user.save();
      }
      response.status(200).send();
    }).clone().catch(function(error){ console.log(error);});
  });

  app.post(`/likeOrUnlike/:photo_id`, function(request, response) {
    if (!request.session.user_id) {
      response.status(401).send("User is not logged in.");
      return;
    }
    Photo.findOne({ _id: request.params.photo_id }, function(err, photo) {
      if (err) {
        response.status(400).send("photo is undefined.");
        return;
      }
  
      let index_of_user = photo.liked_by.indexOf(request.session.user_id);
      if (request.body.like) {
        if (index_of_user >= 0) {
          response.status(400).send("Duplicate likes.");
          return;
        }
        photo.liked_by.push(request.session.user_id);
      } else {
        if (index_of_user === -1) {
          response.status(400).send("Have not liked it.");
          return;
        }
        photo.liked_by.splice(index_of_user, 1);
      }
      photo.save();
      response.status(200).send();
    }).clone().catch(function(error){console.log(error);});
  });
  
  app.get("/deleteFavorite/:photo_id", function(request, response) {
    if (!request.session.user_id) {
      response.status(401).send("User is not logged in.");
      return;
    }
    User.findOne({ _id: request.session.user_id }, (err, user) => {
      if (err) {
        response.status(400).send("user id is undefined.");
        return;
      }
      const index = user.favorites.indexOf(request.params.photo_id);
      user.favorites.splice(index, 1);
      user.save();
      response.status(200).send();
    }).clone().catch((error) =>{ console.log(error);});
  });
  
  
  app.get(`/getFavorites`, function(request, response) {
    if (!request.session.user_id) {
      response.status(401).send("User is not logged in.");
      console.log("here1");
      return;
    }  
    User.findOne({ _id: request.session.user_id }, (err, user) => {
      if (err) {
        response.status(400).send("user id is undefined.");
        console.log("here2");
        return;
      }
      console.log("here3");
      let favorites = user.favorites;
      let favoritesArray = [];
      async.each(
        favorites,
        (photo_id, callback) => {
          Photo.findOne({ _id: photo_id }, function(err2, photo) {
            if (err2) {
              response.status(200).send("photo id is undefined.");
              return;
            }
            favoritesArray.push({
              file_name: photo.file_name,
              date_time: photo.date_time,
              _id: photo._id
            });
            callback();
          });
        },
        function(err3) {
          if (err3) {
            response.status(400).send("Cannot load favorites.");
            return;
          }
          response.status(200).send(favoritesArray);
        }
      );
    }).clone().catch(function(err3){ console.log(err3);});
  });

  

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});