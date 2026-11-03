/**
 * MedAI-CV — SQLite3 Database Initialization Script
 * Uses Node.js built-in 'node:sqlite' DatabaseSync
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.join(__dirname, 'medai.db');
const schemaPath = path.join(__dirname, 'schema.sql');

console.log('Initializing SQLite3 database at:', dbPath);

// Ensure database directory exists
if (!fs.existsSync(__dirname)) {
  fs.mkdirSync(__dirname, { recursive: true });
}

// Open / Create Database
const db = new DatabaseSync(dbPath);

// Read and execute schema
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);

console.log('SQLite3 tables created and seeded successfully.');

// Test query
const queryRoles = db.prepare('SELECT code, name, department, default_user_name FROM roles').all();
console.log('Registered Roles in SQLite3:');
console.table(queryRoles);

const queryStudies = db.prepare('SELECT id, patient_name, modality, ai_finding, state_code FROM studies').all();
console.log('Clinical Studies in SQLite3:');
console.table(queryStudies);

db.close();
console.log('Database initialization complete.');

