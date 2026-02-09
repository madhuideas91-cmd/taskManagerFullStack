package com.example.taskmanager.task_service.dto;

public class TaskReportResponse {

    private Long projectId;
    private long open;
    private long inProgress;
    private long done;

    public TaskReportResponse() {}

    public TaskReportResponse(Long projectId, long open, long inProgress, long done) {
        this.projectId = projectId;
        this.open = open;
        this.inProgress = inProgress;
        this.done = done;
    }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public long getOpen() { return open; }
    public void setOpen(long open) { this.open = open; }

    public long getInProgress() { return inProgress; }
    public void setInProgress(long inProgress) { this.inProgress = inProgress; }

    public long getDone() { return done; }
    public void setDone(long done) { this.done = done; }
}
