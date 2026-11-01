package com.campusfind.api;

import com.campusfind.model.Student;
import com.campusfind.service.StudentService;
import com.campusfind.web.ApiDtos;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final StudentService students;
    public AuthController(StudentService students) { this.students = students; }

    @PostMapping("/signup")
    public ApiDtos.AuthResponse signUp(@Valid @RequestBody ApiDtos.SignUpRequest request) { return students.signUp(request); }

    @PostMapping("/login")
    public ApiDtos.AuthResponse login(@Valid @RequestBody ApiDtos.LoginRequest request) { return students.signIn(request); }

    @PostMapping("/logout")
    public java.util.Map<String, String> logout(@RequestHeader(value="Authorization", required=false) String authorization) {
        students.signOut(authorization); return java.util.Map.of("message", "Signed out.");
    }

    @GetMapping("/me")
    public ApiDtos.UserDto me(@RequestHeader("Authorization") String authorization) {
        Student student = students.requireStudent(authorization); return students.toDto(student);
    }
}
