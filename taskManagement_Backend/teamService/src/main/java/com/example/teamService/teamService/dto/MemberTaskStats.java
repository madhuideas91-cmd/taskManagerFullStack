package com.example.teamService.teamService.dto;

public class MemberTaskStats {

    private Long userId;
    private int open;
    private int inProgress;
    private int done;

    // Default constructor with userId
    public MemberTaskStats() {
        this.userId = null;
        this.open = 0;
        this.inProgress = 0;
        this.done = 0;
    }

    public MemberTaskStats(Long userId) {
        this.userId = userId;
        this.open = 0;
        this.inProgress = 0;
        this.done = 0;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public int getOpen() {
        return open;
    }

    public void setOpen(int open) {
        this.open = open;
    }

    public int getInProgress() {
        return inProgress;
    }

    public void setInProgress(int inProgress) {
        this.inProgress = inProgress;
    }

    public int getDone() {
        return done;
    }

    public void setDone(int done) {
        this.done = done;
    }
}
