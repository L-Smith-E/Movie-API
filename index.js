const express = require('express');
const morgan = require('morgan');
const fs = require('fs'); 
const path = require('path');
const app = express();
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movie = Models.Movie;
const User = Models.User;

mongoose.connect('mongodb://localhost:27017/cfdb', { useNewUrlParser: true, useUnifiedTopology: true });

// let movies = [
//     { title: 'Inception', director: 'Christopher Nolan'},
//     { title: 'Sinners', director: 'Ryan Coogler'},
//     { title: 'The Dark Knight', director: 'Christopher Nolan'},
//     { title: 'Django Unchained', director: 'Quentin Tarantino'},
//     { title: 'The Matrix', director: 'The Wachowskis'},
//     { title: 'Dune: Part 2', director: 'Denis Villeneuve'},
//     { title: 'Shutter Island', director: 'Martin Scorsese'},
//     { title: 'Interstellar', director: 'Christopher Nolan'},
//     { title: 'Captain America: The Winter Soldier', director: 'Anthony and Joe Russo'},
//     { title: '1917', director: 'Sam Mendes'}
// ];
let users = [];

app.use(express.static('public'));
//const accessLogStream = fs.createWriteStream(path.join(__dirname, 'public'), {flags: 'a'})

// setup the logger
app.use(morgan('combined'));

app.get('/', (req, res) => {
  res.send('Welcome to my book club!\n');
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});


//user endpoints
//test - not for production
app.get('/users', (req, res) => {
    res.json(users);
});

//Allow new users to register ☑️
app.post('/users', async (req, res) => {
    await User.findOne({ Username: req.body.Username })
    .then((user) => {
        if (user) {
            return res.status(400).send(`${req.body.Username} already exists`);
        } else {
            User.create({
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

//Allow users to add a movie to their list of favorites ☑️
// app.post('/users/:id/favourites/:movies', async (req, res) => {
//     await User.findByIdAndUpdate(
//         { _id: req.params.id },
//         { $push: { FavoriteMovies: req.params.movies} },  
//     //find and get movie id from movie database
//     await Movie.findOne({ Title: req.body.Title })
//     .then((movie) => {  
//     if (movie) {
//         const existingMovie = movie;
//       //set movieID to existing movie's id
//         const movieID = existingMovie._id;

//         Movie.updateOne()
//         return res.status(200).send(`${req.body.Username} added ${req.body.Title} to their favourites. Movie ID: ${movieID}`);
//     }
//     else
//     {
//         //create new movie in movie database
//         const newMovie = await Movie.create({
//             Title: req.body.Title,
//             Description: req.body.Description,
//             Genre: req.body.Genre,
//             Director: req.body.Director,
//             Actors: req.body.Actors,

//             ImagePath: req.body.ImagePath,
//             Featured: req.body.Featured
//         })
//         //set movieID to new movie's id
//         .then((movie)=> { const movieID = newMovie._id; res.status(201).json(movie) })
//         .catch((error) => {
//             console.error(error);
//             res.status(500).send('Error: ' + error);
//         })

//     }
// }));

//Allow users to update their user info (username, password, email, date of birth) 
app.put('/users/:id', express.json(), async (req, res) => {
    const currentUsername = User.findById(req.params.id).Username;
    const newUsername = User.findById(req.params.id).Usernames;
    const currentPassword = User.findById(req.params.id).Password; // Safe practice?
    const currentEmail = User.findById(req.params.id).Email;
    const currentBirthdate = User.findById(req.params.id).Birthdate;

    await User.findOneAndUpdate(
        { _id: req.params.id },
        { $set:
            { Username: req.body.Usernames,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthdate: req.body.Birthdate
            }
        },
        { new: true } // This line makes sure that the updated document is returned
    )
    .then((updatedUser) => {

        res.status(201).send(`${req.body.Username}'s account has been updated. Here is the updated user information: ${JSON.stringify(updatedUser)}`);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });

    console.log("Update User Route Hit!");
});

//Allow existing users to deregister
app.delete('/users/:id', (req, res) => {
    res.send(`User with ID ${req.params.id} has been deleted.`);
    console.log("Delete User Route Hit!");
});

//Allow users to remove a movie from their list of favorites
app.delete('/users/:id/favourites/movieId', (req, res) => {
    res.send(`User with ID ${req.params.id} has deleted one of their favourite movie.`);
    console.log("Delete Favourite Movie Route Hit!");
});

//movie endpoints

// Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
    res.json(movies);
});

//Return data about a director (bio, birth year, death year) by name
app.get('/movies/directors/:director', (req, res) => {
    const director = req.params.director;
    res.send(`You requested movies directed by ${director}.`);
});

// Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
app.get('/movies/:title', (req, res) => {
    const title = req.params.title;
    res.send(`You requested the movie "${title}".`);
});

// Return data about a genre (description) by name/title (e.g., “Thriller”)
app.get('/movies/genre/:genre', (req, res) => {
    const genre = req.params.genre;
    res.send(`You requested the genre "${genre}".`);
});

app.post('/movies', express.json(), (req, res) => {
    const newMovie = req.body;
    movies.push(newMovie);
    res.status(201).json(newMovie);
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});
