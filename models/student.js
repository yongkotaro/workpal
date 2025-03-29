import pool from '../db/database.js';

class Student {
    constructor(email, suspend_tag = 0) {
        this.email = email;
        this.suspend_tag = suspend_tag;
    }

    static async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM students WHERE email = ?',
            [email]
        );
        return rows[0] ? new Student(rows[0].email) : null;
    }

    async save() {
        await pool.query(
            `INSERT INTO students (email, suspend_tag) VALUES (?, ?)`,
            [this.email, this.suspend_tag]
        );
    }
}

export default Student;