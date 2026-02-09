package com.example.teamService.teamService.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "team_members",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"teamId", "userId"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long teamId;

    private Long userId;

    private String role; // ADMIN / MEMBER

    private String status; // ACTIVE / INVITED / PENDING
}
