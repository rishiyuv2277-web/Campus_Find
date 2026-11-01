package com.campusfind.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="auth_sessions")
public class AuthSession {
    @Id @Column(length=80) private String token;
    @Column(name="student_id", nullable=false, length=40) private String studentId;
    @Column(name="created_at", nullable=false) private LocalDateTime createdAt;
    protected AuthSession() {}
    public AuthSession(String token,String studentId){this.token=token;this.studentId=studentId;this.createdAt=LocalDateTime.now();}
    public String getToken(){return token;} public String getStudentId(){return studentId;}
}
