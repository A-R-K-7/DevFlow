package com.devflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for triggering a new deployment.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeploymentRequest {

    @NotBlank(message = "Deployment name is required")
    @Size(min = 2, max = 200, message = "Deployment name must be between 2 and 200 characters")
    private String deploymentName;

    @NotBlank(message = "Deployment version is required")
    @Size(max = 50, message = "Version cannot exceed 50 characters")
    private String deploymentVersion;

    @NotBlank(message = "Environment is required")
    private String environment;

    @NotNull(message = "Project ID is required")
    private Long projectId;
}
