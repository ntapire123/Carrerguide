const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read users from file
async function readUsers() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write users to file
async function writeUsers(users) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
}

// Find user by email
async function findUserByEmail(email) {
  const users = await readUsers();
  return users.find(user => user.email === email);
}

// Create or update user
async function saveUser(userData) {
  const users = await readUsers();
  const existingIndex = users.findIndex(user => user.email === userData.email);
  
  const userWithTimestamp = {
    ...userData,
    createdAt: userData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    users[existingIndex] = userWithTimestamp;
  } else {
    users.push(userWithTimestamp);
  }
  
  await writeUsers(users);
  return userWithTimestamp;
}

module.exports = {
  findUserByEmail,
  saveUser
};
