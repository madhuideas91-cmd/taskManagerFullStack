package com.example.teamService.teamService.service;


import com.example.teamService.teamService.client.*;
import com.example.teamService.teamService.dto.MemberTaskStats;
import com.example.teamService.teamService.dto.TeamMemberResponse;
import com.example.teamService.teamService.dto.TeamMemberView;
import com.example.teamService.teamService.model.Team;
import com.example.teamService.teamService.model.TeamAuditLog;
import com.example.teamService.teamService.model.TeamMember;
import com.example.teamService.teamService.repository.TeamAuditRepository;
import com.example.teamService.teamService.repository.TeamMemberRepository;
import com.example.teamService.teamService.repository.TeamRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepo;
    private final TeamMemberRepository memberRepo;
    private final TeamAuditRepository auditRepo;
    private final UserClient userClient;
    private final NotificationClient notificationClient;
    private final UserClient userServiceClient; // ✅ Inject Feign client
    private final TaskServiceClient taskServiceClient;
    // ✅ Add this
    private final ProjectClient projectServiceClient; // Feign client to project-service


    private final SimpMessagingTemplate messagingTemplate; // ✅ WebSocket template


    // Create Team
    public Team createTeam(String name, Long createdBy) {
        Team team = Team.builder().name(name).createdBy(createdBy).build();
        Team saved = teamRepo.save(team);

        TeamMember admin = TeamMember.builder()
                .teamId(saved.getId())
                .userId(createdBy)
                .role("ADMIN")
                .status("ACTIVE")
                .build();
        memberRepo.save(admin);

        auditRepo.save(TeamAuditLog.builder()
                .teamId(saved.getId())
                .action("Created team")
                .performedBy(createdBy)
                .build());

        return saved;
    }

    // Add Member
    public TeamMember addMember(Long teamId, String email, Long performedBy) {
        Long userId = userClient.getUserIdByEmail(email);

        if (memberRepo.existsByTeamIdAndUserId(teamId, userId)) {
            throw new RuntimeException("User already exists in this team");
        }

        TeamMember member = TeamMember.builder()
                .teamId(teamId)
                .userId(userId)
                .role("MEMBER")
                .status("INVITED")
                .build();

        TeamMember saved = memberRepo.save(member);

        notificationClient.sendNotification(
                new NotificationRequest("You are invited to join team: " + teamId)
        );

        auditRepo.save(TeamAuditLog.builder()
                .teamId(teamId)
                .action("Added member " + email)
                .performedBy(performedBy)
                .targetUser(userId)
                .build());

        // ✅ Emit WebSocket update
        messagingTemplate.convertAndSend("/topic/team/" + teamId, "MEMBER_ADDED");

        return saved;
    }

//public List<TeamMemberView> getMembers(Long teamId) {
//
//    List<TeamMember> members = memberRepo.findByTeamId(teamId);
//
//    // Call project-service to get project IDs
//    List<Long> projectIds = projectServiceClient.getProjectIdsByTeam(teamId);
//
//    // Get task stats from task-service
//    List<MemberTaskStats> taskStatsList =
//            taskServiceClient.getMemberStats(projectIds);
//
//    // ✅ Map stats by userId
//    Map<Long, MemberTaskStats> statsMap =
//            taskStatsList.stream()
//                    .filter(s -> s.getUserId() != null)
//                    .collect(Collectors.toMap(
//                            MemberTaskStats::getUserId,
//                            s -> s,
//                            (existing, duplicate) -> existing
//                    ));
//
//    return members.stream()
//            .map(member -> {
//
//                String tempEmail = "unknown-user";
//                try {
//                    var response = userClient.getEmailByUserId(member.getUserId());
//                    if (response.getStatusCode().is2xxSuccessful()
//                            && response.getBody() != null) {
//                        tempEmail = response.getBody();
//                    }
//                } catch (Exception ignored) {}
//
//                // ✅ Ensure every member has a stats object, even if they have no tasks
//                MemberTaskStats stats = statsMap.get(member.getUserId());
//                if (stats == null) {
//                    stats = new MemberTaskStats(member.getUserId()); // default 0s
//                }
//
//                return new TeamMemberView(
//                        member.getUserId(),
//                        tempEmail,
//                        member.getRole(),
//                        member.getStatus(),
//                        stats.getOpen(),
//                        stats.getInProgress(),
//                        stats.getDone()
//                );
//            })
//            .toList();
//}

    public List<TeamMemberView> getMembers(Long teamId) {

        List<TeamMember> members = memberRepo.findByTeamId(teamId);

        // ✅ SAFE remote calls
        List<Long> projectIds = new ArrayList<>();
        List<MemberTaskStats> taskStatsList = new ArrayList<>();

        // 1️⃣ Get project IDs
        try {
            projectIds = projectServiceClient.getProjectIdsByTeam(teamId);
        } catch (Exception e) {
            System.out.println("projectServiceClient failed for team " + teamId + ": " + e.getMessage());
        }

        // 2️⃣ Get task stats
        try {
            if (!projectIds.isEmpty()) {
                taskStatsList = taskServiceClient.getMemberStats(projectIds);
            }
        } catch (Exception e) {
            System.out.println("taskServiceClient failed for team " + teamId + ": " + e.getMessage());
        }

        // 3️⃣ Map stats by userId
        Map<Long, MemberTaskStats> statsMap = taskStatsList.stream()
                .filter(s -> s.getUserId() != null)
                .collect(Collectors.toMap(
                        MemberTaskStats::getUserId,
                        s -> s,
                        (existing, duplicate) -> existing
                ));

        // 4️⃣ Build member view safely
        List<TeamMemberView> result = new ArrayList<>();
        for (TeamMember member : members) {

            String email = "unknown-user";
            try {
                ResponseEntity<String> response = userClient.getEmailByUserId(member.getUserId());
                if (response != null && response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    email = response.getBody();
                }
            } catch (Exception e) {
                System.out.println("userClient failed for user " + member.getUserId() + ": " + e.getMessage());
            }

            MemberTaskStats stats = statsMap.getOrDefault(member.getUserId(), new MemberTaskStats(member.getUserId()));

            result.add(new TeamMemberView(
                    member.getUserId(),
                    email,
                    member.getRole(),
                    member.getStatus(),
                    stats.getOpen(),
                    stats.getInProgress(),
                    stats.getDone()
            ));
        }

        return result;
    }

    public List<TeamAuditLog> getAuditLogs(Long teamId) {
        return auditRepo.findByTeamIdOrderByCreatedAtDesc(teamId);
    }

    public TeamMember acceptInvite(Long teamId, Long userId) {

        TeamMember member = memberRepo.findByTeamId(teamId).stream()
                .filter(m -> m.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invite not found"));

        member.setStatus("ACTIVE");
        memberRepo.save(member);

        auditRepo.save(
                TeamAuditLog.builder()
                        .teamId(teamId)
                        .action("ACCEPTED_INVITE")
                        .performedBy(userId)
                        .targetUser(userId)
                        .build()
        );

        return member;
    }


    public void removeMember(Long teamId, Long userId, Long performedBy) {

        memberRepo.findByTeamId(teamId).stream()
                .filter(m -> m.getUserId().equals(userId))
                .findFirst()
                .ifPresent(memberRepo::delete);

        auditRepo.save(TeamAuditLog.builder()
                .teamId(teamId)
                .action("Removed member")
                .performedBy(performedBy)
                .targetUser(userId)
                .build());

        notificationClient.sendNotification(
                new NotificationRequest("You were removed from team: " + teamId)
        );

        // ✅ Emit WebSocket update
        messagingTemplate.convertAndSend("/topic/team/" + teamId, "MEMBER_REMOVED");
    }

    public TeamMember changeRole(Long teamId, Long userId, String role, Long performedBy) {

        TeamMember member = memberRepo.findByTeamId(teamId).stream()
                .filter(m -> m.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Member not found"));

        member.setRole(role);
        TeamMember saved = memberRepo.save(member);

        auditRepo.save(TeamAuditLog.builder()
                .teamId(teamId)
                .action("Changed role to " + role)
                .performedBy(performedBy)
                .targetUser(userId)
                .build());

        // ✅ Emit WebSocket update
        messagingTemplate.convertAndSend("/topic/team/" + teamId, "ROLE_CHANGED");

        return saved;
    }

    public List<Team> getTeamsForUser(Long userId) {
        List<TeamMember> memberships =
                memberRepo.findByUserIdAndStatus(userId, "ACTIVE");

        return memberships.stream()
                .map(m -> teamRepo.findById(m.getTeamId()).orElse(null))
                .filter(Objects::nonNull)
                .toList();
    }

    @Transactional
    public TeamMember inviteMember(Long teamId, Long userId, Long performedBy) {

        Team team = teamRepo.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // 🔐 Only ADMIN can invite
        TeamMember admin = memberRepo
                .findByTeamIdAndUserId(teamId, performedBy)
                .orElseThrow(() -> new RuntimeException("Not a team member"));

        if (!admin.getRole().equals("ADMIN")) {
            throw new RuntimeException("Only admin can invite members");
        }

        // 🚫 Prevent duplicate invite
        if (memberRepo.existsByTeamIdAndUserId(teamId, userId)) {
            throw new RuntimeException("User already invited or exists");
        }

        TeamMember member = TeamMember.builder()
                .teamId(team.getId())
                .userId(userId) // assign invited user's ID
                .role("MEMBER")
                .status("INVITED")
                .build();

        memberRepo.save(member);

        // 🧾 Audit log
        auditRepo.save(
                TeamAuditLog.builder()
                        .teamId(teamId)
                        .action("INVITED_MEMBER")
                        .performedBy(performedBy)
                        .targetUser(userId)
                        .build()
        );

        // ✅ Emit WebSocket update
        messagingTemplate.convertAndSend("/topic/team/" + teamId, "INVITE_ACCEPTED");
        return member;
    }
}
