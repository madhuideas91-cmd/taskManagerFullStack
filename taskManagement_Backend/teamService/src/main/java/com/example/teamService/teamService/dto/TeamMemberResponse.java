package com.example.teamService.teamService.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TeamMemberResponse {
    private Long userId;
    private String email;
    private String role;
    private String status;
}
