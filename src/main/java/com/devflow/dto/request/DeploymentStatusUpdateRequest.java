package com.devflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a deployment's status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeploymentStatusUpdateRequest {

    @NotBlank(message = "Status is required")
    private String status;

    private String logOutput;
}
