package com.campusfind.service;

import com.campusfind.model.AuthSession;
import com.campusfind.model.Student;
import com.campusfind.repository.AuthSessionRepository;
import com.campusfind.repository.StudentRepository;
import com.campusfind.web.ApiDtos;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class StudentService {
    private final StudentRepository students;
    private final AuthSessionRepository sessions;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public StudentService(StudentRepository students, AuthSessionRepository sessions) {
        this.students = students; this.sessions = sessions;
    }

    @Transactional
    public ApiDtos.AuthResponse signUp(ApiDtos.SignUpRequest request) {
        String email = request.email().trim().toLowerCase();
        String roll = request.rollNo().trim().toUpperCase();
        if (students.existsByEmailIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.CONFLICT, "An account already exists for this email.");
        if (students.existsByRollNoIgnoreCase(roll)) throw new ResponseStatusException(HttpStatus.CONFLICT, "That roll number is already registered.");
        Student student = students.save(new Student("u-" + UUID.randomUUID(), request.name().trim(), roll,
                request.department().trim(), email, encoder.encode(request.password())));
        return new ApiDtos.AuthResponse(createSession(student), toDto(student));
    }

    @Transactional
    public ApiDtos.AuthResponse signIn(ApiDtos.LoginRequest request) {
        Student student = students.findByEmailIgnoreCase(request.email().trim()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect."));
        if (!encoder.matches(request.password(), student.getPasswordHash())) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect.");
        return new ApiDtos.AuthResponse(createSession(student), toDto(student));
    }

    public Student requireStudent(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in first.");
        String token = authorization.substring(7).trim();
        AuthSession session = sessions.findById(token).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expired. Please sign in again."));
        return students.findById(session.getStudentId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Student account not found."));
    }

    @Transactional
    public void signOut(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) sessions.deleteById(authorization.substring(7).trim());
    }

    public ApiDtos.UserDto toDto(Student student) {
        return new ApiDtos.UserDto(student.getId(), student.getName(), student.getRollNo(), student.getDepartment(), student.getEmail(), false);
    }

    private String createSession(Student student) {
        String token = UUID.randomUUID().toString() + UUID.randomUUID().toString().replace("-", "");
        sessions.save(new AuthSession(token, student.getId()));
        return token;
    }
}
