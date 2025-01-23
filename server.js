import {
  getAllUsers,
  getUser,
  capitalize,
  getItems,
  submitItem,
  insertUser,
} from './helper.js';

import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000; // Render will provide the port in process.env.PORT

dotenv.config(); // init dotenv

// Only allow requests from this server
const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN;
app.use(
  cors({
    origin: allowedOrigin,
  })
);
// postgress data //
const db = new pg.Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

db.connect(); // connect database

// Gets all users on pageload
app.get('/users', async (_, res) => {
  try {
    const users = await getAllUsers(db);

    res.send({ ok: true, data: users });
  } catch (error) {
    res.status(400).send({ ok: false, message: error.message });
  }
});

// Gets all items reserved for given raid
app.get('/raid', async (req, res) => {
  try {
    const { raid } = req.query;

    if (!raid)
      throw new Error('Could not find a target raid. Please try again.');

    const { rows } = await getItems(raid, db);

    res.send({ ok: true, data: { raid: raid, rows } });
  } catch (error) {
    res.status(400).send({ ok: false, message: error.message });
  }
});

// Login function
app.post('/login', async (req, res) => {
  try {
    const { name, pin } = req.query;

    if (pin.length !== 4) throw new Error('Pin must be 4 characters long.');
    if (!name) throw new Error('Please enter your ingame character name.');

    const user = await getUser(name.toLowerCase(), pin, db);

    res.send({ ok: true, data: user });
  } catch (error) {
    res.status(400).send({ ok: false, message: error.message });
  }
});

// register function
app.post('/register', async (req, res) => {
  try {
    const { name, pin } = req.query;

    if (pin.length !== 4) throw new Error('Pin must be 4 characters long.');
    if (!name) throw new Error('Please enter your ingame character name.');

    const { rows: user } = await insertUser(name.toLowerCase(), pin, db);

    res.send({ ok: true, data: user });
  } catch (error) {
    res.status(400).send({ ok: false, message: error.message });
  }
});

// Reserves a item for given raid
app.post('/reserve', async (req, res) => {
  try {
    const { item, id, name, raid } = req.query;

    if (!item || !id || !raid || !name)
      throw new Error('Oops something went wrong!');

    const data = {
      item: capitalize(item),
      id,
      raid,
      name: capitalize(name),
    };

    const result = await submitItem(data, db);

    res.send({ ok: true, result });
  } catch (error) {
    res.status(400).send({ ok: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log('Site hosting on port: ' + port);
});
