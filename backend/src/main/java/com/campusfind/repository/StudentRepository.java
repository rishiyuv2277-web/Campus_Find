package com.campusfind.repository;
import com.campusfind.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface StudentRepository extends JpaRepository<Student,String> {
    Optional<Student> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByRollNoIgnoreCase(String rollNo);
}
