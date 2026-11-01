package com.campusfind.repository;
import com.campusfind.model.ItemReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ItemReportRepository extends JpaRepository<ItemReport,String> {
    List<ItemReport> findAllByOrderByCreatedAtDesc();
    List<ItemReport> findByReporterIdOrderByCreatedAtDesc(String reporterId);
}
