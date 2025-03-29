BEGIN;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS teachers (
    email VARCHAR(255) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS students (
    email VARCHAR(255) PRIMARY KEY, 
    suspend_tag TINYINT(1) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS classes (
    teacher_email VARCHAR(255),
    student_email VARCHAR(255),
    FOREIGN KEY (teacher_email) REFERENCES teachers(email) ON DELETE CASCADE,
    FOREIGN KEY (student_email) REFERENCES students(email) ON DELETE CASCADE,
    PRIMARY KEY (teacher_email, student_email)
);

TRUNCATE TABLE classes; 
TRUNCATE TABLE students; 
TRUNCATE TABLE teachers; 

INSERT INTO teachers (email) VALUES
('teacherken@gmail.com'),
('teachermary@gmail.com'),
('teacherjohn@gmail.com');

INSERT INTO students (email, suspend_tag) VALUES
('studentjon@gmail.com', 0),  
('studentalex@gmail.com', 0),
('studentlucy@gmail.com', 0);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;