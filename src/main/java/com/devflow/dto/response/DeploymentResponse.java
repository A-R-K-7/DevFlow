package com.devflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for deployment data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeploymentResponse {

    private Long id;
    private String deploymentName;
    private String deploymentVersion;
    private String environment;
    private String deploymentStatus;
    private String triggeredByName;
    private Long triggeredById;
    private Long projectId;
    private String projectName;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String logOutput;
}
