import pool from '../db/database.js';

class Student {
    constructor(email, suspend_tag = 0) {
        this.email = email;
        this.suspend_tag = suspend_tag;
    }

    async save() {
        await pool.query(
            `INSERT INTO students (email, suspend_tag) VALUES (?, ?)`,
            [this.email, this.suspend_tag]
        );
    }

    // Update the suspend tag for a student
    async suspend() {
        this.suspend_tag = 1;
        await pool.query(
            `UPDATE students SET suspend_tag = ? WHERE email = ?`,
            [this.suspend_tag, this.email]
        );
    }

    // Unsuspend a student
    async unsuspend() {
        this.suspend_tag = 0;
        await pool.query(
            'UPDATE students SET suspend_tag = ? WHERE email = ?',
            [this.suspend_tag, this.email]
        );
    }

    // Check if a student exists 
    static async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM students WHERE email = ?',
            [email]
        );
        return rows[0] ? new Student(rows[0].email, rows[0].suspend_tag) : null;
    }
}

export default Student;