package com.example.teamService.teamService.repository;

import com.example.teamService.teamService.model.TeamAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamAuditRepository extends JpaRepository<TeamAuditLog, Long> {
    List<TeamAuditLog> findByTeamIdOrderByCreatedAtDesc(Long teamId);
}
