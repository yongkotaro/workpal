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

    // Check if a teacher exists in the database
    static async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM teachers WHERE email = ?',
            [email]
        );
        return rows[0] ? new Teacher(rows[0].email) : null;
    }

    // Get students for a specific teacher
    async getStudents() {
        const [students] = await pool.query(
            `SELECT student_email FROM classes WHERE teacher_email=?`,
            [this.email]
        );
        return students
    }
}

export default Teacher;