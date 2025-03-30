import { register } from '../../controllers/register-controller.js';
import Student from '../../models/student.js';
import Teacher from '../../models/teacher.js';
import pool from '../../db/database.js';

// Mock the models and database
jest.mock('../../models/student.js');
jest.mock('../../models/teacher.js');
jest.mock('../../db/database.js');

describe('Register Controller', () => {
    let req, res;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup mock request and response
        req = {
            body: {
                teacher: 'teacher@example.com',
                students: ['student1@example.com', 'student2@example.com']
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
    });

    it('should return 400 for invalid request format', async () => {
        const invalidRequests = [
            { teacher: null, students: ['student@example.com'] },
            { teacher: 'teacher@example.com', students: null },
            { teacher: null, students: null },
            { students: ['student@example.com'] }, // missing teacher
            { teacher: 'teacher@example.com' } // missing students
        ];

        for (const invalidReq of invalidRequests) {
            req.body = invalidReq;
            await register(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid request format' });

            // Reset mocks for next iteration
            res.status.mockClear();
            res.json.mockClear();
        }
    });

    it('should return 404 if teacher does not exist', async () => {
        Teacher.findByEmail.mockResolvedValue(null);

        await register(req, res);

        expect(Teacher.findByEmail).toHaveBeenCalledWith('teacher@example.com');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Teacher with  teacher@example.com does not exist\''
        });
    });

    it('should return 404 if any student does not exist', async () => {
        Teacher.findByEmail.mockResolvedValue({ email: 'teacher@example.com' });

        // First student exists, second doesn't
        Student.findByEmail.mockImplementation((email) =>
            email === 'student1@example.com'
                ? Promise.resolve({ email })
                : Promise.resolve(null)
        );

        await register(req, res);

        expect(Student.findByEmail).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Student student2@example.com not found'
        });
    });

    it('should create classes for all students if none exist', async () => {
        // Mock teacher exists
        Teacher.findByEmail.mockResolvedValue({ email: 'teacher@example.com' });

        // Mock all students exist
        Student.findByEmail.mockImplementation((email) =>
            Promise.resolve({ email })
        );

        // Mock no existing classes
        pool.query.mockImplementation((query, params) => {
            if (query.includes('SELECT * FROM classes')) {
                return Promise.resolve([[]]); // No existing relationships
            }
            return Promise.resolve();
        });

        await register(req, res);

        // Should check for existing relationships twice (one for each student)
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM classes'),
            expect.any(Array)
        );

        // Should create two new relationships
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO classes'),
            ['teacher@example.com', 'student1@example.com']
        );
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO classes'),
            ['teacher@example.com', 'student2@example.com']
        );

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    it('should skip creating classes that already exist', async () => {
        // Mock teacher exists
        Teacher.findByEmail.mockResolvedValue({ email: 'teacher@example.com' });

        // Mock all students exist
        Student.findByEmail.mockImplementation((email) =>
            Promise.resolve({ email })
        );

        // Mock existing relationship for first student
        pool.query.mockImplementation((query, params) => {
            if (query.includes('SELECT * FROM classes')) {
                if (params[1] === 'student1@example.com') {
                    return Promise.resolve([[{ teacher_email: 'teacher@example.com', student_email: 'student1@example.com' }]]);
                }
                return Promise.resolve([[]]); // No relationship for second student
            }
            return Promise.resolve();
        });

        await register(req, res);

        // Should only create relationship for second student
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO classes'),
            ['teacher@example.com', 'student2@example.com']
        );

        // Should not try to create relationship for first student
        const allCalls = pool.query.mock.calls;
        const insertCalls = allCalls.filter(call => call[0].includes('INSERT INTO classes'));
        expect(insertCalls.length).toBe(1);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
        Teacher.findByEmail.mockRejectedValue(new Error('Database error'));

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});