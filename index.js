const express = require('express');
const morgan = require('morgan');
const fs = require('fs'); 
const path = require('path');
const app = express();
const uuid = require('uuid');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movie = Models.Movie;
const User = Models.User;


mongoose.connect('mongodb://localhost:27017/cfdb');
//, { useNewUrlParser: true, useUnifiedTopology: true } - no longer necessary in mongoose 6+


app.use(express.static('public'));
//const accessLogStream = fs.createWriteStream(path.join(__dirname, 'public'), {flags: 'a'})

app.use(express.json());

// setup the logger
app.use(morgan('combined'));

app.use(bodyParser.urlencoded({ extended: true }));
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.get('/', (req, res) => {
  res.send('Welcome to my book club!\n');
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});


//user endpoints -----------------------------------------------------------------------------------------------
//test - Get All Users - not for production ✅
app.get('/users', async(req, res) => {
    await User.find()
    .then((users) => {
        res.status(200).json(users);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
    console.log("Get All Users Route Hit!");
    // res.json(users);
});

//Allow new users to register ✅
app.post('/users', async (req, res) => {
    await User.findOne({ username: req.body.username })
    .then((user) => {
        if (user) {
            return res.status(400).send(`${req.body.username} already exists`);
        } else {
            User.create({
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
                birthdate: req.body.birthdate
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error.message);
            })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    });
});

//Allow users to add a movie to their list of favorites ☑️
app.post('/users/:id/favourites/:movies', async (req, res) => {
    await User.findByIdAndUpdate(
        { _id: req.params.id },
        { $push: { FavoriteMovies: req.params.movies} })
    .then((user) => {
        res.status(201).send(`${req.body.Username} added a new favourite movie.`);
    })
    .catch((error) => {
        console.error(error);  
        res.status(500).send('Error: ' + error);
    });
});

//Allow users to add a movie to their list of favorites - updated version to check movie DB first ✅
app.post('/users/:username/favourites', async (req, res) => {
    //Check to see if movie already exists in movie database
    await Movie.findOne({ title: req.body.title })
    .then((movie) => {  
    if (movie) {
    //const existingMovie = movie;
    //set movieID to existing movie's id
    const movieID = movie._id;

    //add movieID to user's list of favourite movies
    User.findOneAndUpdate({ username: req.params.username }, { $push: { favoriteMovies: movieID } })
    .then((user) => { 
    return res.status(200).send(`${req.params.username} added ${req.body.title} to their favourites. Movie ID: ${movieID}`);
    })
    .catch((error) => {
        console.error(error);   
        res.status(500).send('Error: ' + error);
    });
    }
    else
    {
        //create new movie in movie database
        Movie.create({
            title: req.body.title,
            description: req.body.description,
            genre: req.body.genre,
            director: req.body.director,
            actors: req.body.actors,
            imagePath: req.body.imagePath,
            featured: req.body.featured
        })
        //If movie creation is successful, add movie to user's favourites
        .then((movie)=> { const movieID = movie._id; 
            User.findOneAndUpdate({ username: req.params.username }, { $push: { favoriteMovies: movieID } })
            .then((user) => { 
            return res.status(200).send(`${req.body.username} added ${req.body.title} to their favourites. Movie ID: ${movieID}`);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error.message);
            });
        })
    }
});
});

//Allow users to update their user info (username, password, email, date of birth) ✅
app.put('/users/:username', express.json(), async (req, res) => {
    // const currentUsername = User.findById(req.params.id).Username;
    // const newUsername = User.findById(req.params.id).Usernames;
    // const currentPassword = User.findById(req.params.id).Password; // Safe practice?
    // const currentEmail = User.findById(req.params.id).Email;
    // const currentBirthdate = User.findById(req.params.id).Birthdate;

    await User.findOneAndUpdate(
        { username: req.params.username },
        { $set:
            { username: req.body.username,
              password: req.body.password,
              email: req.body.email,
              birthdate: req.body.birthdate
            }
        },
        { new: true } // This line makes sure that the updated document is returned
    )
    .then((updatedUser) => {

        res.status(201).send(`${req.body.username}'s account has been updated. Here is the updated user information: ${JSON.stringify(updatedUser)}`);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });

    console.log("Update User Route Hit!");
});

//Allow existing users to deregister ✅
app.delete('/users/:username', async (req, res) => {
    await User.findOneAndDelete({ username: req.params.username })
    .then((user) => {
        if (!user) {
            return res.status(400).send(`User with ID ${req.params.username} not found.`);
        }
        else {
            return res.status(200).send(`User with ID ${req.params.username} has been deleted.`);
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
    console.log("Delete User Route Hit!");
});

//Allow users to remove a movie from their list of favorites ✅
app.delete('/users/:username/favourites/:movieid', async(req, res) => {
    await Movie.findOne({ title: req.params.movieid })
    .then((movie) => {
        if (movie) {
        const movieID = movie._id;
        
    User.findOneAndUpdate({ username: req.params.username }, { $pull: { favoriteMovies: movieID } })
    .then((user) => {
        if (!user) {
            return res.status(400).send(`User with username ${req.params.username} not found.`);
        }
        else {
            return res.status(200).send(`Movie with ID ${req.params.movieid} has been removed from user's favourites: ${JSON.stringify(user)}.`);
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    });
    }
    else {
        return res.status(400).send(`Movie with ID ${req.params.movieid} not found.`);
    }
    })
    console.log("Delete Favourite Movie Route Hit!");
});



//movie endpoints -----------------------------------------------------------------------------------------------

// Return a list of ALL movies to the user ✅
app.get('/movies', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Movie.find()
    .then((movies) => {
        res.status(200).json(movies);
    })
    .catch((error) => {
        console.error(error.message);
        res.status(500).send('Error: ' + error.message);
    });
    //res.json(movies);
    console.log("Get All Movies Route Hit!");
});

// Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user ✅
app.get('/movies/:title', async (req, res) => {
    await Movie.findOne({ title: req.params.title })
    .then((movie) => {
        res.status(200).send(`Here is your requested information for "${req.params.title}: ${JSON.stringify(movie)}". `);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
    console.log("Get Movie by Title Route Hit!");
});

//Return data about a director (bio, birth year, death year) by name (e.g., “Christopher Nolan”)    ✅
app.get('/movies/directors/:director', async(req, res) => {
    await Movie.findOne({ 'director.name': req.params.director })
    .then((movie) => {
        if (!movie) {
            return res.status(400).send(`Director "${req.params.director}" not found.`);
        }
        res.status(200).send(`You requested movies directed by ${req.params.director}: ${movie.director}.`);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
    console.log("Get Director by Name Route Hit!");
    // const director = req.params.director;
    // res.send(`You requested movies directed by ${director}.`);
});

// Return data about a genre (description) by name/title (e.g., “Thriller”) ✅
app.get('/movies/genre/:genre', async (req, res) => {
    await Movie.findOne({ "genre.name": req.params.genre })
    .then((genreD) => {
        if (!genreD) {
            return res.status(400).send(`Genre "${req.params.genre}" not found.`);
        }
        res.status(200).send(`You requested the genre "${req.params.genre}": ${genreD.genre.description}.`);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
    console.log("Get Genre by Name Route Hit!");
    // const genre = req.params.genre;
    // res.send(`You requested the genre "${genre}".`);
});

//Allow new movies to be added to the database
app.post('/movies', express.json(), async(req, res) => {
    await Movie.create({
        Title: req.body.Title,
        Description: req.body.Description,
        Genre: req.body.Genre,
        Director: req.body.Director,
        Actors: req.body.Actors,
        ImagePath: req.body.ImagePath,
        Featured: req.body.Featured
    })
    .then((movie) => { res.status(201).json(movie) })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
    console.log("Add New Movie Route Hit!");

    // const newMovie = req.body;
    // movies.push(newMovie);
    // res.status(201).json(newMovie);
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!: ' + err.message);
});

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});
