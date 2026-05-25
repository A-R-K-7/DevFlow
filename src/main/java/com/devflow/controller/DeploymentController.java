package com.devflow.controller;

import com.devflow.dto.request.DeploymentRequest;
import com.devflow.dto.request.DeploymentStatusUpdateRequest;
import com.devflow.dto.response.ApiResponse;
import com.devflow.dto.response.DeploymentResponse;
import com.devflow.dto.response.PagedResponse;
import com.devflow.service.DeploymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for deployment management operations.
 * Supports triggering deployments, status updates, and filtered queries.
 */
@RestController
@RequestMapping("/api/deployments")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Deployments", description = "Deployment management and tracking APIs")
public class DeploymentController {

    private final DeploymentService deploymentService;

    @Operation(
            summary = "Trigger a new deployment",
            description = "Creates a new deployment in PENDING status and starts async simulation. " +
                    "Requires ADMIN, DEVELOPER, or RELEASE_MANAGER role."
    )
    @PostMapping
    public ResponseEntity<ApiResponse<DeploymentResponse>> triggerDeployment(
            @Valid @RequestBody DeploymentRequest request,
            Authentication authentication) {
        DeploymentResponse deployment = deploymentService.triggerDeployment(request, authentication.getName());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Deployment triggered successfully", deployment));
    }

    @Operation(
            summary = "Update deployment status",
            description = "Manually updates a deployment's status. Valid transitions: " +
                    "PENDING→RUNNING, RUNNING→SUCCESS, RUNNING→FAILED. Requires ADMIN or RELEASE_MANAGER role."
    )
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<DeploymentResponse>> updateDeploymentStatus(
            @PathVariable Long id,
            @Valid @RequestBody DeploymentStatusUpdateRequest request,
            Authentication authentication) {
        DeploymentResponse deployment = deploymentService.updateDeploymentStatus(
                id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Deployment status updated", deployment));
    }

    @Operation(
            summary = "Get all deployments",
            description = "Retrieves all deployments with optional filtering by environment and status, " +
                    "with pagination and sorting support."
    )
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<DeploymentResponse>>> getAllDeployments(
            @RequestParam(required = false) String environment,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        PagedResponse<DeploymentResponse> deployments =
                deploymentService.getAllDeployments(environment, status, page, size, sortBy, direction);
        return ResponseEntity.ok(ApiResponse.success("Deployments retrieved successfully", deployments));
    }

    @Operation(
            summary = "Get deployments by project",
            description = "Retrieves all deployments for a specific project with pagination."
    )
    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<PagedResponse<DeploymentResponse>>> getDeploymentsByProject(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<DeploymentResponse> deployments =
                deploymentService.getDeploymentsByProject(projectId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Project deployments retrieved", deployments));
    }

    @Operation(
            summary = "Get recent deployments",
            description = "Retrieves the 10 most recent deployments across all projects."
    )
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<DeploymentResponse>>> getRecentDeployments() {
        List<DeploymentResponse> deployments = deploymentService.getRecentDeployments();
        return ResponseEntity.ok(ApiResponse.success("Recent deployments retrieved", deployments));
    }
}
