package com.example.teamService.teamService.repository;

import com.example.teamService.teamService.model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    List<TeamMember> findByTeamId(Long teamId);

    List<TeamMember> findByUserId(Long userId);

    boolean existsByTeamIdAndUserId(Long teamId, Long userId);

    List<TeamMember> findByUserIdAndStatus(Long userId, String status);

    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);

    // ❌ REMOVED (CAUSE OF CRASH)
    // boolean existsByTeamIdAndEmail(Long teamId, String email);
}
