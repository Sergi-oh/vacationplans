const pg = require('pg');
const client = new pg.Client('postgres://localhost/vacation_planner_db');
const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());

const homePage = path.join(__dirname, 'index.html');
app.get('/', (req, res)=> res.sendFile(homePage));

const reactApp = path.join(__dirname, 'dist/main.js');
app.get('/dist/main.js', (req, res)=> res.sendFile(reactApp));

const reactSourceMap = path.join(__dirname, 'dist/main.js.map');
app.get('/dist/main.js.map', (req, res)=> res.sendFile(reactSourceMap));

const styleSheet = path.join(__dirname, 'styles.css');
app.get('/styles.css', (req, res)=> res.sendFile(styleSheet));

app.get('/api/users', async(req, res, next)=> {
  try{
    const SQL = `
      SELECT *
      FROM users
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/places', async(req, res, next)=> {
  try{
    const SQL = `
      SELECT *
      FROM places
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/vacations', async(req, res, next)=> {
  try{
    const SQL = `
      SELECT *
      FROM vacations
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/vacations', async(req, res, next)=> {
  try{
    const SQL = `
      INSERT INTO vacations(user_id, place_id, note) VALUES($1, $2, $3) RETURNING *
    `;
    const response = await client.query(SQL, [ req.body.user_id, req.body.place_id, req.body.note ]);
    res.send(response.rows[0]);
  }
  catch(ex){
    next(ex);
  }
});

app.delete('/api/vacations/:id', async(req, res, next)=> {
  try{
    const SQL = `
      DELETE FROM vacations WHERE id = $1
    `;
    await client.query(SQL, [ req.params.id ]);
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});




const init = async()=> {
  await client.connect();
  console.log('connected to database');
  const SQL = `
  DROP TABLE IF EXISTS vacations;
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS places;
  CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE
  );
  CREATE TABLE places(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
  );
  CREATE TABLE vacations(
    id SERIAL PRIMARY KEY,
    place_id INTEGER REFERENCES places(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT now()

  );
  INSERT INTO users(name) VALUES ('Ethyl');
  INSERT INTO users(name) VALUES ('Curly');
  INSERT INTO users(name) VALUES ('Lucy');
  INSERT INTO users(name) VALUES ('Moe');
  INSERT INTO users(name) VALUES ('Larry');
  INSERT INTO places(name) VALUES ('JAPAN');
  INSERT INTO places(name) VALUES ('MEXICO');
  INSERT INTO places(name) VALUES ('LOS ANGELES');
  INSERT INTO places(name) VALUES ('FRANCE');
  INSERT INTO vacations(user_id, place_id, note) VALUES (
    (SELECT id FROM users WHERE name='Lucy'),
    (SELECT id FROM places WHERE name='JAPAN'),
    'hello world'
  );
  `;

  await client.query(SQL);
  console.log('create your tables and seed data');

  const port = process.env.PORT || 3000;
  app.listen(port, ()=> {
    console.log(`listening on port ${port}`);
  });
}

init();
