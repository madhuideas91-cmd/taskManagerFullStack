package com.example.teamService.teamService.controller;


import com.example.teamService.teamService.dto.TeamMemberView;
import com.example.teamService.teamService.model.Team;
import com.example.teamService.teamService.model.TeamAuditLog;
import com.example.teamService.teamService.model.TeamMember;
import com.example.teamService.teamService.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping("/create")
    public Team createTeam(@RequestParam String name, @RequestParam Long createdBy) {
        return teamService.createTeam(name, createdBy);
    }

    @PostMapping("/{teamId}/add-member")
    public TeamMember addMember(@PathVariable Long teamId,
                                @RequestParam String email,
                                @RequestParam Long performedBy) {
        return teamService.addMember(teamId, email, performedBy);
    }

    @GetMapping("/{teamId}/members")
    public List<TeamMemberView> getMembers(@PathVariable Long teamId) {
        return teamService.getMembers(teamId);
    }

    @GetMapping("/{teamId}/audit")
    public List<TeamAuditLog> getAuditLogs(@PathVariable Long teamId) {
        return teamService.getAuditLogs(teamId);
    }

    @PutMapping("/{teamId}/accept")
    public TeamMember acceptInvite(
            @PathVariable Long teamId,
            @RequestParam Long userId
    ) {
        return teamService.acceptInvite(teamId, userId);
    }

    @DeleteMapping("/{teamId}/remove-member")
    public void removeMember(
            @PathVariable Long teamId,
            @RequestParam Long userId,
            @RequestParam Long performedBy
    ) {
        teamService.removeMember(teamId, userId, performedBy);
    }

    @PutMapping("/{teamId}/change-role")
    public TeamMember changeRole(
            @PathVariable Long teamId,
            @RequestParam Long userId,
            @RequestParam String role,
            @RequestParam Long performedBy
    ) {
        return teamService.changeRole(teamId, userId, role, performedBy);
    }

    @GetMapping("/my-teams")
    public List<Team> getMyTeams(@RequestParam Long userId) {
        return teamService.getTeamsForUser(userId);
    }

    @PutMapping("/{teamId}/invite")
    public TeamMember inviteMember(
            @PathVariable Long teamId,
            @RequestParam String email,
            @RequestParam Long performedBy
    ) {
        // call service directly with email
        return teamService.addMember(teamId, email, performedBy);
    }

    // TeamController.java in team-service
//    @GetMapping("/api/teams/member-ids")
//    public List<Long> getTeamMemberIds(@RequestParam Long teamId) {
//        return teamService.getMemberIds(teamId); // return List<Long> of userIds
//    }
}
