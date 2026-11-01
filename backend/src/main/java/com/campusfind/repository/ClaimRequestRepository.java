package com.campusfind.repository;
import com.campusfind.model.ClaimRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ClaimRequestRepository extends JpaRepository<ClaimRequest,String> {
    List<ClaimRequest> findAllByOrderByCreatedAtDesc();
}
