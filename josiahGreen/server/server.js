'use strict';

// Application dependencies
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bodyParser = require('body-parser').urlencoded({extended: true});
const superagent = require('superagent');

// Application Setup
const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;
const TOKEN = process.env.TOKEN;

// DONE: Explain the following line of code. What is the API_KEY? Where did it come from? This is your key to be able to access the Google Books API. This came from Google when we registered.
const API_KEY = process.env.GOOGLE_API_KEY;

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Application Middleware
app.use(cors());

// API Endpoints
app.get('/api/v1/admin', (req, res) => res.send(TOKEN === parseInt(req.query.token)));

app.get('/api/v1/books/find', (req, res) => {
  let url = 'https://www.googleapis.com/books/v1/volumes';

  // DONE: Explain the following four lines of code. How is the query built out? What information will be used to create the query? This allows whatever information the user has submitted, to be sent as a query to the database. The if statement only happens if the user actually filled in the box it is assigned to, otherwise it won't make a query at all.
  let query = '';
  if(req.query.title) query += `+intitle:${req.query.title}`;
  if(req.query.author) query += `+inauthor:${req.query.author}`;
  if(req.query.isbn) query += `+isbn:${req.query.isbn}`;

  // DONE: What is superagent? How is it being used here? What other libraries are available that could be used for the same purpose? Superagent is an http request library (with a cool name). It's ultimately used to make SQL queries. We could have also used Ajax, Fetch API, or Bonus helper for this (...or those appear to be the popular ones anyway).
  superagent.get(url)
    .query({'q': query})
    .query({'key': API_KEY})
    .then(response => response.body.items.map((book, idx) => {

      // DONE: The line below is an example of destructuring. Explain destructuring in your own words. Destructuring allows 5 lines of code to be translated into one line, and it also has the flexibility to easily be updated with the risk of much less bugs.
      let { title, authors, industryIdentifiers, imageLinks, description } = book.volumeInfo;

      // DONE: What is the purpose of the following placeholder image? It's a placeholder image. If no image is available, the placeholder image will be shown instead.
      let placeholderImage = 'http://www.newyorkpaddy.com/images/covers/NoCoverAvailable.jpg';

      // DONE: Explain how ternary operators are being used below. The ternary operators are returning true if the information is there, if not it will return false. Ex: If there is a title then return the title, if not then return 'No authors available'.
      return {
        title: title ? title : 'No title available',
        author: authors ? authors[0] : 'No authors available',
        isbn: industryIdentifiers ? `ISBN_13 ${industryIdentifiers[0].identifier}` : 'No ISBN available',
        image_url: imageLinks ? imageLinks.smallThumbnail : placeholderImage,
        description: description ? description : 'No description available',
        book_id: industryIdentifiers ? `${industryIdentifiers[0].identifier}` : '',
      };
    }))
    .then(arr => res.send(arr))
    .catch(console.error);
});

// DONE: How does this route differ from the route above? What does ':isbn' refer to in the code below? This route is based on the books isbn number. Each book is assigned a specific number, so when a number is requested it will return the book that is attached to it. 
app.get('/api/v1/books/find/:isbn', (req, res) => {
  let url = 'https://www.googleapis.com/books/v1/volumes';
  superagent.get(url)
    .query({ 'q': `+isbn:${req.params.isbn}`})
    .query({ 'key': API_KEY })
    .then(response => response.body.items.map((book, idx) => {
      let { title, authors, industryIdentifiers, imageLinks, description } = book.volumeInfo;
      let placeholderImage = 'http://www.newyorkpaddy.com/images/covers/NoCoverAvailable.jpg';

      return {
        title: title ? title : 'No title available',
        author: authors ? authors[0] : 'No authors available',
        isbn: industryIdentifiers ? `ISBN_13 ${industryIdentifiers[0].identifier}` : 'No ISBN available',
        image_url: imageLinks ? imageLinks.smallThumbnail : placeholderImage,
        description: description ? description : 'No description available',
      };
    }))
    .then(book => res.send(book[0]))
    .catch(console.error);
});

app.get('/api/v1/books', (req, res) => {
  client.query('SELECT book_id, title, author, image_url, isbn FROM books;')
    .then(results => res.send(results.rows))
    .catch(console.error);
});

app.get('/api/v1/books/:id', (req, res) => {
  client.query(`SELECT * FROM books WHERE book_id=${req.params.id}`)
    .then(results => res.send(results.rows))
    .catch(console.error);
});

app.post('/api/v1/books', bodyParser, (req, res) => {
  let {title, author, isbn, image_url, description} = req.body;
  client.query(`
    INSERT INTO books(title, author, isbn, image_url, description) VALUES($1, $2, $3, $4, $5)`,
    [title, author, isbn, image_url, description]
  )
    .then(results => res.sendStatus(201))
    .catch(console.error);
});

app.put('/api/v1/books/:id', bodyParser, (req, res) => {
  let {title, author, isbn, image_url, description} = req.body;
  client.query(`
    UPDATE books
    SET title=$1, author=$2, isbn=$3, image_url=$4, description=$5
    WHERE book_id=$6`,
    [title, author, isbn, image_url, description, req.params.id]
  )
    .then(() => res.sendStatus(204))
    .catch(console.error);
});

app.delete('/api/v1/books/:id', (req, res) => {
  client.query('DELETE FROM books WHERE book_id=$1', [req.params.id])
    .then(() => res.sendStatus(204))
    .catch(console.error);
});

app.get('*', (req, res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));