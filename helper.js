export async function getAllUsers(db) {
  const query = 'SELECT id, name FROM users;';

  try {
    const res = await db.query(query);
    return res.rows;
  } catch (err) {
    console.error('Error executing query:', err);
  }
}

export async function getUser(name, pin, db) {
  const query = `
    SELECT id, name FROM users
    WHERE name = $1 AND pin = $2;
  `;

  const values = [name, pin]; // Use parameterized queries to prevent SQL injection

  try {
    const res = await db.query(query, values);

    const [user] = res.rows;

    if (!user) throw new Error('No user found! Have you made an account yet?');

    return user;
  } catch (err) {
    throw err;
  }
}

export async function insertUser(name, pin, db) {
  const { rows: user } = await db.query('SELECT * FROM users WHERE name = $1', [
    name,
  ]);

  if (user.length > 0)
    throw new Error('An account with this character name already exists!');

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

export async function getItems(raid, db) {
  const query = `
    SELECT 
      id, 
      name, 
      item, 
      TO_CHAR(date, 'DD/MM/YY, HH24:MI') AS formatted_date 
    FROM ${raid};
  `;

  try {
    const res = await db.query(query);
    return res;
  } catch (err) {
    throw err;
  }
}

export async function submitItem(data, db) {
  const { id, item, name, raid } = data;

  const { rows } = await db.query(`SELECT * FROM ${raid} WHERE id = $1`, [id]);

  if (rows.length > 0)
    await db.query('DELETE FROM blackwing_lair WHERE id = $1', [id]);

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

export function capitalize(str) {
  return str
    .toLowerCase()
    .split('_')
    .map(item => item.replace(item[0], item[0].toUpperCase()))
    .join(' ');
}
