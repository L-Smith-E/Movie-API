const express = require('express');
const morgan = require('morgan');
const fs = require('fs'); 
const path = require('path');
const app = express();


let movies = [
    { title: 'Inception', director: 'Christopher Nolan'},
    { title: 'Sinners', director: 'Ryan Coogler'},
    { title: 'The Dark Knight', director: 'Christopher Nolan'},
    { title: 'Django Unchained', director: 'Quentin Tarantino'},
    { title: 'The Matrix', director: 'The Wachowskis'},
    { title: 'Dune: Part 2', director: 'Denis Villeneuve'},
    { title: 'Shutter Island', director: 'Martin Scorsese'},
    { title: 'Interstellar', director: 'Christopher Nolan'},
    { title: 'Captain America: The Winter Soldier', director: 'Anthony and Joe Russo'},
    { title: '1917', director: 'Sam Mendes'}
];

app.use(express.static('public'));
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'public'), {flags: 'a'})

// setup the logger
app.use(morgan('combined'));

app.get('/', (req, res) => {
  res.send('Welcome to my book club!\n');
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

app.get('/movies', (req, res) => {
    res.json(movies);
});

app.get('/movies/:director', (req, res) => {
    const director = req.params.director;
});

app.get('/movies/:title', (req, res) => {
    const title = req.params.title;
});

app.get('/movies/:title/:genre', (req, res) => {
    const title = req.params.title;
    const genre = req.params.genre;
    res.send(`You requested the movie "${title}" of genre "${genre}".`);
});

app.post('/movies', express.json(), (req, res) => {
    const newMovie = req.body;
    movies.push(newMovie);
    res.status(201).json(newMovie);
});

app.post('/users', express.json(), (req, res) => {
    const newUser = req.body;
    res.status(201).json(newUser);
});

app.post('/users/:id/:favourites', express.json(), (req, res) => {
    newFavourites = req.body;
    res.status(201).json(newFavourites);
});

app.put('/users/:id/:usernames', express.json(), (req, res) => {
    res.send(`User with ID ${req.params.id} has updated their username to ${req.params.usernames}.`);
});




app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});
