package com.campusfind.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="claim_requests")
public class ClaimRequest {
    @Id @Column(length=40) private String id;
    @Column(name="report_id", nullable=false, length=40) private String reportId;
    @Column(name="claimant_name", nullable=false, length=120) private String claimantName;
    @Column(name="claimant_email", nullable=false, length=190) private String claimantEmail;
    @Column(name="secret_detail", nullable=false, length=1000) private String secretDetail;
    @Column(length=1000) private String message;
    @Column(nullable=false, length=20) private String status;
    @Column(name="created_at", nullable=false) private LocalDateTime createdAt;
    protected ClaimRequest() {}
    public ClaimRequest(String id,String reportId,String claimantName,String claimantEmail,String secretDetail,String message){
        this.id=id;this.reportId=reportId;this.claimantName=claimantName;this.claimantEmail=claimantEmail;this.secretDetail=secretDetail;this.message=message;this.status="pending";this.createdAt=LocalDateTime.now();
    }
    public String getId(){return id;} public String getReportId(){return reportId;} public String getClaimantName(){return claimantName;}
    public String getClaimantEmail(){return claimantEmail;} public String getSecretDetail(){return secretDetail;} public String getMessage(){return message;}
    public String getStatus(){return status;} public LocalDateTime getCreatedAt(){return createdAt;} public void setStatus(String status){this.status=status;}
}
