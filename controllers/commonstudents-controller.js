import Teacher from "../models/teacher.js";

export const getCommonStudents = async (req, res) => {
    try {
        let teacherEmails = req.query.teacher;

        // Convert to array if single teacher provided
        if (!Array.isArray(teacherEmails)) {
            teacherEmails = [teacherEmails];
        }

        // Validate request 
        if (!teacherEmails) {
            return res.status(400).json({
                message: 'Invalid request format'
            });
        }

        // Check all teachers exist 
        const teachers = await Promise.all(
            teacherEmails.map(email => Teacher.findByEmail(email))
        );

        const missingIndex = teachers.findIndex(t => !t);
        if (missingIndex !== -1) {
            return res.status(400).json({
                message: `Teacher ${teacherEmails[missingIndex]} not found`
            });
        }

        // Get students for each teacher
        const studentLists = await Promise.all(
            teachers.map(teacher => teacher.getStudents())
        );

        console.log("Student Lists:", studentLists);

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
        console.error("Error in getCommonStudents:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};