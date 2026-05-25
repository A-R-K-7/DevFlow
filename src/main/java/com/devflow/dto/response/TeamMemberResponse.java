package com.devflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for team member data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMemberResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userRole;
    private Long projectId;
    private String projectName;
    private String projectRole;
    private LocalDateTime assignedAt;
}
