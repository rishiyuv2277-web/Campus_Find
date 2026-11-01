package com.campusfind.repository;
import com.campusfind.model.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AuthSessionRepository extends JpaRepository<AuthSession,String> {}
