package com.campusfind.api;

import com.campusfind.model.ItemReport;
import com.campusfind.model.Student;
import com.campusfind.repository.ItemReportRepository;
import com.campusfind.service.ReportService;
import com.campusfind.service.StudentService;
import com.campusfind.web.ApiDtos;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reports;
    private final StudentService students;
    private final ItemReportRepository repository;
    public ReportController(ReportService reports, StudentService students, ItemReportRepository repository) {
        this.reports=reports; this.students=students; this.repository=repository;
    }

    @GetMapping public List<ItemReport> list() { return reports.list(); }
    @GetMapping("/mine") public List<ItemReport> mine(@RequestHeader("Authorization") String auth) { return reports.mine(students.requireStudent(auth)); }
    @GetMapping("/{id}") public ItemReport get(@PathVariable String id) { return reports.get(id); }
    @GetMapping("/{id}/matches") public List<ReportService.MatchResult> matches(@PathVariable String id) { return reports.matches(id); }

    @PostMapping public ItemReport create(@Valid @RequestBody ApiDtos.ReportRequest request, @RequestHeader("Authorization") String auth) {
        return reports.create(request, students.requireStudent(auth));
    }
    @PutMapping("/{id}") public ItemReport update(@PathVariable String id, @Valid @RequestBody ApiDtos.ReportRequest request, @RequestHeader("Authorization") String auth) {
        return reports.update(id, request, students.requireStudent(auth));
    }
    @DeleteMapping("/{id}") public java.util.Map<String,String> delete(@PathVariable String id, @RequestHeader("Authorization") String auth) {
        reports.delete(id, students.requireStudent(auth)); return java.util.Map.of("message", "Report withdrawn.");
    }
}
