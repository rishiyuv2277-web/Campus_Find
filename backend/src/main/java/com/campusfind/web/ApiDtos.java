package com.campusfind.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public final class ApiDtos {
    private ApiDtos() {}

    public record UserDto(String id, String name, String rollNo, String department, String email, boolean demo) {}
    public record AuthResponse(String token, UserDto user) {}
    public record SignUpRequest(@NotBlank @Size(min=3,max=120) String name,
                                @NotBlank @Size(min=3,max=50) String rollNo,
                                @NotBlank @Size(max=120) String department,
                                @NotBlank @Email @Size(max=190) String email,
                                @NotBlank @Size(min=8,max=100) String password) {}
    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record ReportRequest(@NotBlank String type, @NotBlank @Size(max=150) String name,
                                @NotBlank String category, @NotBlank @Size(max=1000) String description,
                                @NotNull LocalDate date, String time, @NotBlank String location,
                                @NotBlank @Size(max=1000) String features, String image,
                                String status, @NotBlank String contact, String handover) {}

    public record ClaimRequestDto(@NotBlank String reportId, @NotBlank String claimantName,
                                  @NotBlank @Email String claimantEmail, @NotBlank @Size(max=1000) String secretDetail,
                                  @Size(max=1000) String message) {}
    public record ClaimStatusRequest(@NotBlank String status) {}
    public record ErrorResponse(String error) {}
}
