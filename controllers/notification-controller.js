import Student from "../models/student.js";
import Teacher from "../models/teacher.js";

export const retrieveStudents = async (req, res) => {
    try {
        const { teacher, notification } = req.body;

        // Validate request format
        if (!teacher || !notification) {
            return res.status(400).json({ message: 'Invalid request format' });
        }

        // Check if teacher exists
        const teacherInstance = await Teacher.findByEmail(teacher);
        if (!teacherInstance) {
            return res.status(404).json({
                message: `Teacher with email ${teacher} does not exist`
            });
        }

        // Extract mentioned students from notification text
        const mentionedStudents = notification.match(/@([\w.-]+@[\w.-]+\.[a-zA-Z]{2,6})/g) || [];
        const mentionedStudentEmails = mentionedStudents.map(email => email.substring(1));

        // Get all students registered with the teacher
        const studentsRegisteredWithTeacher = await teacherInstance.getStudents();
        const registeredStudentEmails = studentsRegisteredWithTeacher.map(student => student.student_email);

        // Combine both mentioned students and registered students
        const allEligibleEmails = [...new Set([...mentionedStudentEmails, ...registeredStudentEmails])];

        // Check for suspended students and filter them out
        const eligibleStudents = [];
        for (let email of allEligibleEmails) {
            const student = await Student.findByEmail(email);
            if (student && student.suspend_tag == 0) {
                eligibleStudents.push(email);
            }
        }

        // Return the list of eligible students
        res.status(200).json({ students: eligibleStudents });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};