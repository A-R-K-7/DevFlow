package com.devflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for project data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectResponse {

    private Long id;
    private String projectName;
    private String description;
    private String repositoryUrl;
    private String createdByName;
    private Long createdById;
    private int deploymentCount;
    private int teamMemberCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
