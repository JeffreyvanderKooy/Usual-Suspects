// Fetches all users from database
export async function getAllUsers(db) {
  const query = 'SELECT id, name, admin FROM users;';

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (err) {
    console.error('Error executing query:', err);
  }
}

// fetches a single user from database
export async function getUser(name, pin, db) {
  const query = `
    SELECT id, name, admin, pin FROM users
    WHERE name = $1;
  `;

  const values = [name]; // Use parameterized queries to prevent SQL injection

  try {
    const res = await db.query(query, values);

    const [user] = res.rows;

    if (!user) throw new Error('No user found! Have you made an account yet?');
    if (user.pin != pin) throw new Error('Wrong pin!');

    return user;
  } catch (err) {
    throw err;
  }
}

// inserts a new user into the database
export async function insertUser(name, pin, db) {
  // check if there already is a user with this name
  const { rows: user } = await db.query('SELECT * FROM users WHERE name = $1', [
    name,
  ]);

  // if so throw error
  if (user.length > 0)
    throw new Error('An account with this character name already exists!');

  // add new user into database
  const query = `
    INSERT INTO users (name, pin)
    VALUES ($1, $2)
    RETURNING id, name;
  `;
  const values = [name, pin];

  try {
    const res = await db.query(query, values);
    return res;
  } catch (err) {
    throw err;
  }
}

// get items for given raid from database
export async function getItems(raid, db) {
  // retrieves all items from database for given raid
  const query = `
    SELECT 
      id, 
      name, 
      item, 
      TO_CHAR(date, 'DD/MM/YY, HH24:MI') AS formatted_date,
      bonus
    FROM ${raid};
  `;

  try {
    const res = await db.query(query);
    return res;
  } catch (err) {
    throw err;
  }
}

// submit a item to reserve to database
export async function submitItem(data, db) {
  const { id, item, name, raid } = data;

  // see if there is a item reserved already for this user
  const { rows } = await db.query(`SELECT * FROM ${raid} WHERE id = $1`, [id]);

  // if there is an item delete it from the database
  if (rows.length > 0)
    await db.query(`DELETE FROM ${raid} WHERE id = $1`, [id]);

  // insert new item into databse
  const query = ` 
    INSERT INTO ${raid} (id, item, name)
    VALUES ($1, $2, $3)
     RETURNING id, name, item, TO_CHAR(date, 'DD/MM/YY, HH24:MI') AS formatted_date;
  `;

  const values = [id, item, name];

  try {
    const res = await db.query(query, values);
    return res;
  } catch (err) {
    throw err;
  }
}

export async function incrementAttendance(id, raid, bonus, db) {
  const query = `
                UPDATE ${raid}
                SET bonus = $1
                WHERE id = $2;
                `;
  const values = [bonus, id];

  try {
    await db.query(query, values);
    const res = await db.query(
      `SELECT id, 
      name, 
      item, 
      TO_CHAR(date, 'DD/MM/YY, HH24:MI') AS formatted_date,
      bonus FROM ${raid} WHERE id = $1;`,
      [id]
    );
    return res;
  } catch (err) {
    throw err;
  }
}

export function capitalize(str) {
  return str
    .toLowerCase()
    .split('_')
    .map(item => item.replace(item[0], item[0].toUpperCase()))
    .join(' ');
}
