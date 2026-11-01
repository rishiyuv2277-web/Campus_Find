package com.campusfind.service;

import com.campusfind.model.ItemReport;
import com.campusfind.model.Student;
import com.campusfind.repository.ItemReportRepository;
import com.campusfind.web.ApiDtos;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {
    private final ItemReportRepository reports;
    public ReportService(ItemReportRepository reports) { this.reports = reports; }

    public List<ItemReport> list() { return reports.findAllByOrderByCreatedAtDesc(); }
    public ItemReport get(String id) { return reports.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found.")); }
    public List<ItemReport> mine(Student student) { return reports.findByReporterIdOrderByCreatedAtDesc(student.getId()); }

    @Transactional
    public ItemReport create(ApiDtos.ReportRequest r, Student student) {
        validateType(r.type());
        String id = "CF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String status = r.status() == null || r.status().isBlank() ? "open" : r.status();
        validateStatus(status);
        String handover = "found".equals(r.type()) ? (r.handover() == null ? "with-student" : r.handover()) : null;
        ItemReport report = new ItemReport(id, r.type().toLowerCase(), r.name().trim(), r.category(), r.description().trim(), r.date(),
                r.time(), r.location(), r.features().trim(), r.image(), status, r.contact().trim(), student.getId(), student.getName(), handover, false);
        return reports.save(report);
    }

    @Transactional
    public ItemReport update(String id, ApiDtos.ReportRequest r, Student student) {
        ItemReport current = get(id);
        if (!current.getReporterId().equals(student.getId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own reports.");
        if (r.type() != null) validateType(r.type());
        if (r.status() != null) validateStatus(r.status());
        current.update(r.type() == null ? null : r.type().toLowerCase(), blankToNull(r.name()), blankToNull(r.category()),
                r.description(), r.date(), r.time(), r.location(), r.features(), r.image(), r.status(), r.contact(), r.handover());
        return reports.save(current);
    }

    @Transactional
    public void delete(String id, Student student) {
        ItemReport current = get(id);
        if (!current.getReporterId().equals(student.getId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only withdraw your own reports.");
        reports.delete(current);
    }

    public List<MatchResult> matches(String id) {
        ItemReport target = get(id);
        return reports.findAllByOrderByCreatedAtDesc().stream()
                .filter(r -> !r.getId().equals(target.getId()))
                .filter(r -> !r.getType().equals(target.getType()))
                .filter(r -> !"returned".equals(r.getStatus()))
                .map(r -> score(target, r))
                .filter(m -> m.score() >= 2)
                .sorted(Comparator.comparingInt(MatchResult::score).reversed())
                .collect(Collectors.toList());
    }

    private MatchResult score(ItemReport a, ItemReport b) {
        int score = 0; List<String> reasons = new ArrayList<>();
        if (a.getCategory().equalsIgnoreCase(b.getCategory())) { score++; reasons.add("Same category"); }
        Set<String> nameA = words(a.getName()), nameB = words(b.getName());
        Set<String> nameOverlap = intersection(nameA, nameB);
        if (!nameOverlap.isEmpty()) { score++; reasons.add("Item name mentions " + String.join(", ", nameOverlap.stream().limit(2).toList())); }
        if (a.getLocation().equalsIgnoreCase(b.getLocation())) { score++; reasons.add("Same campus location — " + b.getLocation()); }
        if (intersection(words(a.getDescription()), words(b.getDescription())).size() > 1) { score++; reasons.add("Descriptions share keywords"); }
        if (!intersection(words(a.getFeatures()), words(b.getFeatures())).isEmpty()) { score++; reasons.add("Distinguishing details share keywords"); }
        String strength = score >= 4 ? "strong" : score >= 3 ? "possible" : "weak";
        return new MatchResult(b, score, strength, reasons);
    }
    private Set<String> words(String s) { if(s==null)return Set.of(); return Arrays.stream(s.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").split("\\s+")).filter(w -> w.length()>2).collect(Collectors.toSet()); }
    private Set<String> intersection(Set<String> a, Set<String> b) { Set<String> x = new LinkedHashSet<>(a); x.retainAll(b); return x; }
    private void validateType(String type) { if (!List.of("lost", "found").contains(type.toLowerCase())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Report type must be lost or found."); }
    private void validateStatus(String status) { if (!List.of("open", "under-review", "matched", "returned").contains(status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid report status."); }
    private String blankToNull(String s) { return s == null || s.isBlank() ? null : s; }
    public record MatchResult(ItemReport report, int score, String strength, List<String> reasons) {}
}
