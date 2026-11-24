import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInitialData } from '../data/initialData.js';

const defaultFile = fileURLToPath(new URL('../../data/db.json', import.meta.url));
const databaseFile = process.env.DOSBROS_DATA_FILE
    ? path.resolve(process.env.DOSBROS_DATA_FILE)
    : defaultFile;

let database;

function copy(value) {
    return value === undefined ? undefined : structuredClone(value);
}

function save() {
    fs.mkdirSync(path.dirname(databaseFile), { recursive: true });
    fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2), 'utf8');
}

function load() {
    if (database) {
        return database;
    }

    try {
        database = JSON.parse(fs.readFileSync(databaseFile, 'utf8'));
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }

        database = createInitialData();
        save();
    }

    const initialData = createInitialData();
    for (const [name, values] of Object.entries(initialData)) {
        if (!Array.isArray(database[name])) {
            database[name] = values;
        }
    }

    return database;
}

class DatabaseRepository {
    read() {
        return copy(load());
    }

    update(change) {
        const result = change(load());
        save();
        return copy(result);
    }
}

export default new DatabaseRepository();
