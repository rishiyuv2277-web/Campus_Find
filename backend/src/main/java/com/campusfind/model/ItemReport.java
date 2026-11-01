package com.campusfind.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_reports")
public class ItemReport {
    @Id @Column(length = 40) private String id;
    @Column(nullable=false, length=10) private String type;
    @Column(nullable=false, length=150) private String name;
    @Column(nullable=false, length=40) private String category;
    @Column(nullable=false, length=1000) private String description;
    @Column(name="report_date", nullable=false) private LocalDate date;
    @Column(name="report_time", length=30) private String time;
    @Column(nullable=false, length=180) private String location;
    @Column(nullable=false, length=1000) private String features;
    @Column(columnDefinition="TEXT") private String image;
    @Column(nullable=false, length=30) private String status;
    @Column(nullable=false, length=190) private String contact;
    @Column(name="reporter_id", nullable=false, length=40) private String reporterId;
    @Column(name="reporter_name", nullable=false, length=120) private String reporterName;
    @Column(name="created_at", nullable=false) private LocalDateTime createdAt;
    @Column(length=30) private String handover;
    @Column(nullable=false) private boolean seed = false;

    protected ItemReport() {}
    public ItemReport(String id, String type, String name, String category, String description, LocalDate date,
                      String time, String location, String features, String image, String status, String contact,
                      String reporterId, String reporterName, String handover, boolean seed) {
        this.id=id; this.type=type; this.name=name; this.category=category; this.description=description; this.date=date;
        this.time=time; this.location=location; this.features=features; this.image=image; this.status=status; this.contact=contact;
        this.reporterId=reporterId; this.reporterName=reporterName; this.createdAt=LocalDateTime.now(); this.handover=handover; this.seed=seed;
    }
    public String getId(){return id;} public String getType(){return type;} public String getName(){return name;} public String getCategory(){return category;}
    public String getDescription(){return description;} public LocalDate getDate(){return date;} public String getTime(){return time;} public String getLocation(){return location;}
    public String getFeatures(){return features;} public String getImage(){return image;} public String getStatus(){return status;} public String getContact(){return contact;}
    public String getReporterId(){return reporterId;} public String getReporterName(){return reporterName;} public LocalDateTime getCreatedAt(){return createdAt;}
    public String getHandover(){return handover;} public boolean isSeed(){return seed;}
    public void update(String type, String name, String category, String description, LocalDate date, String time, String location,
                       String features, String image, String status, String contact, String handover) {
        if(type!=null)this.type=type; if(name!=null)this.name=name; if(category!=null)this.category=category;
        if(description!=null)this.description=description; if(date!=null)this.date=date; if(time!=null)this.time=time;
        if(location!=null)this.location=location; if(features!=null)this.features=features; if(image!=null)this.image=image;
        if(status!=null)this.status=status; if(contact!=null)this.contact=contact; if(handover!=null)this.handover=handover;
    }
    public void setStatus(String status){this.status=status;}
}
