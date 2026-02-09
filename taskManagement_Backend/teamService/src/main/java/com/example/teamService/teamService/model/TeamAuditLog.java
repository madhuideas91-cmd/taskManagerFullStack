package com.example.teamService.teamService.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "team_audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long teamId;

    private String action;

    private Long performedBy;

    private Long targetUser;

    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
