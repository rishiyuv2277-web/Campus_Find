package com.campusfind.service;

import com.campusfind.model.ClaimRequest;
import com.campusfind.model.ItemReport;
import com.campusfind.model.Student;
import com.campusfind.repository.ClaimRequestRepository;
import com.campusfind.repository.ItemReportRepository;
import com.campusfind.web.ApiDtos;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@Service
public class ClaimService {
    private final ClaimRequestRepository claims;
    private final ItemReportRepository reports;
    public ClaimService(ClaimRequestRepository claims, ItemReportRepository reports) { this.claims=claims; this.reports=reports; }

    public List<ClaimRequest> list() { return claims.findAllByOrderByCreatedAtDesc(); }

    @Transactional
    public ClaimRequest create(ApiDtos.ClaimRequestDto dto, Student student) {
        ItemReport report = reports.findById(dto.reportId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found."));
        if (!"found".equals(report.getType())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Claims can only be made against found items.");
        ClaimRequest claim = new ClaimRequest("CL-" + UUID.randomUUID().toString().substring(0,8).toUpperCase(), report.getId(),
                student.getName(), student.getEmail(), dto.secretDetail().trim(), dto.message());
        report.setStatus("under-review");
        reports.save(report);
        return claims.save(claim);
    }

    @Transactional
    public ClaimRequest setStatus(String id, String status) {
        if (!List.of("pending", "approved", "declined").contains(status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid claim status.");
        ClaimRequest claim = claims.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim not found."));
        claim.setStatus(status);
        if ("approved".equals(status)) reports.findById(claim.getReportId()).ifPresent(r -> { r.setStatus("returned"); reports.save(r); });
        return claims.save(claim);
    }
}
