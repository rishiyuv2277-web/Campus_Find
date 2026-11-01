package com.campusfind.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
public class Student {
    @Id @Column(length = 40) private String id;
    @Column(nullable = false, length = 120) private String name;
    @Column(name = "roll_no", nullable = false, unique = true, length = 50) private String rollNo;
    @Column(nullable = false, length = 120) private String department;
    @Column(nullable = false, unique = true, length = 190) private String email;
    @Column(name = "password_hash", nullable = false, length = 100) private String passwordHash;
    @Column(name = "created_at", nullable = false) private LocalDateTime createdAt;

    protected Student() {}
    public Student(String id, String name, String rollNo, String department, String email, String passwordHash) {
        this.id=id; this.name=name; this.rollNo=rollNo; this.department=department; this.email=email; this.passwordHash=passwordHash; this.createdAt=LocalDateTime.now();
    }
    public String getId(){return id;} public String getName(){return name;} public String getRollNo(){return rollNo;}
    public String getDepartment(){return department;} public String getEmail(){return email;} public String getPasswordHash(){return passwordHash;}
    public LocalDateTime getCreatedAt(){return createdAt;}
}
