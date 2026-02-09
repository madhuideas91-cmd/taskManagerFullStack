package com.example.teamService.teamService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TeamMemberView {
    private Long userId;
    private String email;
    private String role;
    private String status;
    private int openTasks;
    private int inProgressTasks;
    private int doneTasks;
}
