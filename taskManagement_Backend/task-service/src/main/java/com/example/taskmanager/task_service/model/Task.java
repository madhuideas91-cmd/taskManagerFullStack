package com.example.taskmanager.task_service.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String status;
    private String description;
    private String priority;

    @ElementCollection(fetch = FetchType.EAGER) // dont change anything
    @CollectionTable(
            name = "task_assignees",
            joinColumns = @JoinColumn(name = "task_id")
    )
    @Column(name = "assignee_id")
    private Set<Long> assignees = new HashSet<>();

    @Column(name = "due_date")
    private LocalDate dueDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "task_tags", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "tag")
    private Set<String> tags = new HashSet<>();

    @Column(name = "project_id")
    private Long projectId;

    public Task() {}

    public Task(String title, String status, String description, String priority,
                String assignee, LocalDate dueDate, Long projectId) {
        this.title = title;
        this.status = status;
        this.description = description;
        this.priority = priority;
        this.dueDate = dueDate;
        this.projectId = projectId;
    }

    // -------------------- Getters & Setters --------------------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public Set<String> getTags() { return tags; }
    public void setTags(Set<String> tags) { this.tags = tags; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    // ✅ FIXED: match Set<Long>
    public Set<Long> getAssignees() {
        return assignees;
    }

    public void setAssignees(Set<Long> assignees) {
        this.assignees = assignees;
    }
}
