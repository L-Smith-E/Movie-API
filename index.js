const express = require('express');
morgan = require('morgan');
fs = require('fs'), 
path = require('path');
const app = express();


let movies = [
    { title: 'Inception', director: 'Christopher Nolan'},
    { title: 'Sinners', director: 'Ryan Coogler'},
    { title: 'The Dark Knight', director: 'Christopher Nolan'},
    { title: 'Django Unchained', director: 'Quentin Tarantino'},
    { title: 'Dune', director: 'Denis Villeneuve'},
    { title: 'The Matrix', director: 'The Wachowskis'},
    { title: 'Dune: Part 2', director: 'Denis Villeneuve'},
    { title: 'Shutter Island', director: 'Martin Scorsese'},
    { title: 'Interstellar', director: 'Christopher Nolan'},
    { title: 'The Wolf of Wall Street', director: 'Martin Scorsese'},
    { title: 'Captain America: The Winter Soldier', director: 'Anthony and Joe Russo'},
    { title: 'Avengers: Endgame', director: 'Anthony and Joe Russo'},
    { title: '1917', director: 'Sam Mendes'},
    { title: 'The Social Network', director: 'David Fincher'},
    { title: 'Tron: Legacy', director: 'Joseph Kosinski'},
    { title: 'Indiana Jones and the Raiders of the Lost Ark', director: 'Steven Spielberg'},
    { title: 'Rogue One: A Star Wars Story', director: 'Gareth Edwards'},
    { title: 'Spider-Man: Into the Spiderverse', director: 'Bob Persichetti, Peter Ramsey, Rodney Rothman'},
    { title: 'Spider-Man: Across the Spider-Verse', director: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson'},
    { title: 'Scott Pilgrim vs. The World', director: 'Edgar Wright'}
];

app.use(express.static('public'));
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

app.get('/', (req, res) => {
  res.send('Welcome to my book club!\n');
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

app.get('/movies', (req, res) => {
    res.json(movies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});
