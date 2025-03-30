import Student from "../models/student.js";
import Teacher from "../models/teacher.js";
import pool from "../db/database.js";

export const register = async (req, res) => {
    try {
        const { teacher, students } = req.body;

        // Validate request 
        if (!teacher || !students) {
            return res.status(400).json({ message: 'Invalid request format' });
        }

        // Check if teacher exists
        const teacherInstance = await Teacher.findByEmail(teacher);
        if (!teacherInstance) {
            return res.status(404).json({
                message: `Teacher with  ${teacher} does not exist'`
            });
        }

        // Check if students exists
        const studentCheck = await Promise.all(
            students.map(email => Student.findByEmail(email))
        );

        const missingStudentIndex = studentCheck.findIndex(s => !s);
        if (missingStudentIndex !== -1) {
            return res.status(404).json({
                message: `Student ${students[missingStudentIndex]} not found`
            });
        }

        // Create classes for each student to the teacher
        await Promise.all(students.map(async (email) => {
            // Check if relationship already exists
            const [existing] = await pool.query(
                `SELECT * FROM classes 
                 WHERE teacher_email = ? AND student_email = ?`,
                [teacher, email]
            );

            // Skip if already exists 
            if (existing.length > 0) {
                return;
            }

            // Create new class with teacher and student
            await pool.query(
                `INSERT INTO classes (teacher_email, student_email) 
                 VALUES (?, ?)`,
                [teacher, email]
            );
        }));

        res.status(204).send();

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
