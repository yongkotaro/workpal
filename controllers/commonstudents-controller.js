import Teacher from "../models/teacher.js";

export const getCommonStudents = async (req, res) => {
    try {
        let teacherEmails = req.query.teacher;

        // Validate request 
        if (!teacherEmails) {
            return res.status(400).json({
                message: 'Invalid request format'
            });
        }

        // Convert to array if single teacher provided
        if (!Array.isArray(teacherEmails)) {
            teacherEmails = [teacherEmails];
        }

        // Check all teachers exist 
        const teachers = await Promise.all(
            teacherEmails.map(email => Teacher.findByEmail(email))
        );

        const missingIndex = teachers.findIndex(t => !t);
        if (missingIndex !== -1) {
            return res.status(404).json({
                message: `Teacher ${teacherEmails[missingIndex]} not found`
            });
        }

        // Get students for each teacher
        const studentLists = await Promise.all(
            teachers.map(teacher => teacher.getStudents())
        );

        // Find intersection of common students
        const commonStudents = studentLists.reduce((a, b) =>
            a.filter(studentA => b.some(studentB => studentB.student_email === studentA.student_email))
        );

        // Map the result to extract only the student emails
        const commonStudentEmails = commonStudents.map(student => student.student_email);

        // If no common students found, return empty array
        if (commonStudentEmails.length === 0) {
            return res.status(200).json({ students: [] });
        }

        // Return the common students as emails
        return res.status(200).json({ students: commonStudentEmails });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};