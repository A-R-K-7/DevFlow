package com.devflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for assigning a team member to a project.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMemberRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Project role is required")
    private String projectRole;
}
