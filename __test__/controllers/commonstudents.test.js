import { getCommonStudents } from '../../controllers/commonstudents-controller.js';
import Teacher from '../../models/teacher.js';

// Mock the Teacher model
jest.mock('../../models/teacher.js');

describe('getCommonStudents Controller', () => {
    let req, res;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup mock request and response
        req = {
            query: {
                teacher: ['teacher1@example.com', 'teacher2@example.com']
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('should return 400 when teacher parameter is empty string', async () => {
        req.query.teacher = '';

        await getCommonStudents(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Invalid request format'
        });
    });

    it('should return 404 if any teacher does not exist', async () => {
        // First teacher exists, second doesn't
        Teacher.findByEmail.mockImplementation(email =>
            email === 'teacher1@example.com'
                ? Promise.resolve({ email })
                : Promise.resolve(null)
        );

        await getCommonStudents(req, res);

        expect(Teacher.findByEmail).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Teacher teacher2@example.com not found'
        });
    });

    it('should find common students across multiple teachers', async () => {
        // Mock teachers exist
        const teacher1 = {
            email: 'teacher1@example.com',
            getStudents: jest.fn().mockResolvedValue([
                { student_email: 'common@student.com' },
                { student_email: 'student1@example.com' }
            ])
        };

        const teacher2 = {
            email: 'teacher2@example.com',
            getStudents: jest.fn().mockResolvedValue([
                { student_email: 'common@student.com' },
                { student_email: 'student2@example.com' }
            ])
        };

        Teacher.findByEmail.mockImplementation(email =>
            email === 'teacher1@example.com'
                ? Promise.resolve(teacher1)
                : Promise.resolve(teacher2)
        );

        await getCommonStudents(req, res);

        // Verify both teachers' getStudents were called
        expect(teacher1.getStudents).toHaveBeenCalled();
        expect(teacher2.getStudents).toHaveBeenCalled();

        // Should return only the common student
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            students: ['common@student.com']
        });
    });

    it('should return empty array if no common students found', async () => {
        // Mock teachers exist but have no common students
        const teacher1 = {
            email: 'teacher1@example.com',
            getStudents: jest.fn().mockResolvedValue([
                { student_email: 'student1@example.com' }
            ])
        };

        const teacher2 = {
            email: 'teacher2@example.com',
            getStudents: jest.fn().mockResolvedValue([
                { student_email: 'student2@example.com' }
            ])
        };

        Teacher.findByEmail.mockImplementation(email =>
            email === 'teacher1@example.com'
                ? Promise.resolve(teacher1)
                : Promise.resolve(teacher2)
        );

        await getCommonStudents(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            students: []
        });
    });

    it('should handle database errors', async () => {
        Teacher.findByEmail.mockRejectedValue(new Error('Database error'));

        await getCommonStudents(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });

    it('should handle case with one teacher having no students', async () => {
        const teacher1 = {
            email: 'teacher1@example.com',
            getStudents: jest.fn().mockResolvedValue([
                { student_email: 'student1@example.com' }
            ])
        };

        const teacher2 = {
            email: 'teacher2@example.com',
            getStudents: jest.fn().mockResolvedValue([]) // no students
        };

        Teacher.findByEmail.mockImplementation(email =>
            email === 'teacher1@example.com'
                ? Promise.resolve(teacher1)
                : Promise.resolve(teacher2)
        );

        await getCommonStudents(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            students: []
        });
    });
});