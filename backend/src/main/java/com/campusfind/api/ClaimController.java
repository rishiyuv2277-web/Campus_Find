package com.campusfind.api;

import com.campusfind.model.ClaimRequest;
import com.campusfind.model.Student;
import com.campusfind.service.ClaimService;
import com.campusfind.service.StudentService;
import com.campusfind.web.ApiDtos;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {
    private final ClaimService claims; private final StudentService students;
    public ClaimController(ClaimService claims, StudentService students) { this.claims=claims; this.students=students; }
    @GetMapping public List<ClaimRequest> list(@RequestHeader("Authorization") String auth) { students.requireStudent(auth); return claims.list(); }
    @PostMapping public ClaimRequest create(@Valid @RequestBody ApiDtos.ClaimRequestDto request, @RequestHeader("Authorization") String auth) {
        return claims.create(request, students.requireStudent(auth));
    }
    @PatchMapping("/{id}/status") public ClaimRequest status(@PathVariable String id, @Valid @RequestBody ApiDtos.ClaimStatusRequest request,
                                                               @RequestHeader("Authorization") String auth) {
        students.requireStudent(auth); return claims.setStatus(id, request.status());
    }
}
