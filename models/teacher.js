import pool from '../db/database.js';

class Teacher {
    constructor(email) {
        this.email = email;
    }

    async save() {
        await pool.query(
            `INSERT INTO teachers (email) VALUES (?)`,
            [this.email]
        );
    }

    static async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM teachers WHERE email = ?',
            [email]
        );
        return rows[0] ? new Teacher(rows[0].email) : null;
    }

    async findStudents() {
        const [students] = await pool.query(
            `SELECT student_email FROM classes WHERE teacher_email=?`,
            [this.email]
        );
        return students
    }
}

export default Teacher;