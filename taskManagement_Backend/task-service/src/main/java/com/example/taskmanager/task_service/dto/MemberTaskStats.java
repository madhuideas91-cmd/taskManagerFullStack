package com.example.taskmanager.task_service.dto;

public class MemberTaskStats {

    private Long userId;
    private long open;
    private long inProgress;
    private long done;

    public MemberTaskStats() {}

    public MemberTaskStats(Long userId, long open, long inProgress, long done) {
        this.userId = userId;
        this.open = open;
        this.inProgress = inProgress;
        this.done = done;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public long getOpen() { return open; }
    public void setOpen(long open) { this.open = open; }

    public long getInProgress() { return inProgress; }
    public void setInProgress(long inProgress) { this.inProgress = inProgress; }

    public long getDone() { return done; }
    public void setDone(long done) { this.done = done; }
}
