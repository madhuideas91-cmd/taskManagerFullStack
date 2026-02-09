package com.example.taskmanager.task_service.dto;
import jakarta.validation.constraints.NotBlank;


import java.util.Set;

public class TaskRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String status; // keep as String for now to avoid changing other code

    private String description;
    private String priority;
    private String assignee;
    private String dueDate;

    private Set<String> tags;

    private Long projectId;

    private Set<Long> assignees;



    // getters and setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public Set<String> getTags() { return tags; }
    public void setTags(Set<String> tags) { this.tags = tags; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public Set<Long> getAssignees() {
        return assignees;
    }

    public void setAssignees(Set<Long> assignees) {
        this.assignees = assignees;
    }

}
