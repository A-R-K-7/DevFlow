package com.devflow.service;

import com.devflow.dto.request.DeploymentRequest;
import com.devflow.dto.request.DeploymentStatusUpdateRequest;
import com.devflow.dto.response.DeploymentResponse;
import com.devflow.dto.response.PagedResponse;
import com.devflow.entity.Deployment;
import com.devflow.entity.Project;
import com.devflow.entity.User;
import com.devflow.entity.enums.DeploymentStatus;
import com.devflow.entity.enums.Environment;
import com.devflow.exception.BadRequestException;
import com.devflow.exception.InvalidDeploymentStateException;
import com.devflow.exception.ResourceNotFoundException;
import com.devflow.repository.DeploymentRepository;
import com.devflow.repository.ProjectRepository;
import com.devflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for managing deployments.
 * Handles deployment triggering, status updates, filtering, and lifecycle management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DeploymentService {

    private final DeploymentRepository deploymentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final DeploymentSimulationService simulationService;

    /**
     * Triggers a new deployment for a project.
     * The deployment starts in PENDING status and an async simulation is kicked off.
     *
     * @param request   the deployment request
     * @param userEmail the email of the triggering user
     * @return the deployment response
     */
    @Transactional
    public DeploymentResponse triggerDeployment(DeploymentRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        Environment environment;
        try {
            environment = Environment.valueOf(request.getEnvironment().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(
                    "Invalid environment: " + request.getEnvironment() + ". Valid: DEV, QA, STAGING, PRODUCTION");
        }

        Deployment deployment = Deployment.builder()
                .deploymentName(request.getDeploymentName())
                .deploymentVersion(request.getDeploymentVersion())
                .environment(environment)
                .deploymentStatus(DeploymentStatus.PENDING)
                .triggeredBy(user)
                .project(project)
                .build();

        Deployment savedDeployment = deploymentRepository.save(deployment);
        log.info("Deployment triggered: '{}' v{} to {} for project '{}' by {}",
                savedDeployment.getDeploymentName(),
                savedDeployment.getDeploymentVersion(),
                environment,
                project.getProjectName(),
                userEmail);

        auditLogService.log("TRIGGER", "DEPLOYMENT", savedDeployment.getId(),
                userEmail, String.format("Triggered deployment '%s' v%s to %s",
                        savedDeployment.getDeploymentName(),
                        savedDeployment.getDeploymentVersion(),
                        environment));

        // Kick off async deployment simulation
        simulationService.simulateDeployment(savedDeployment.getId());

        return mapToResponse(savedDeployment);
    }

    /**
     * Updates the status of an existing deployment.
     * Validates state transitions (only valid transitions are allowed).
     *
     * @param id        the deployment ID
     * @param request   the status update request
     * @param userEmail the email of the user performing the update
     * @return the updated deployment response
     */
    @Transactional
    public DeploymentResponse updateDeploymentStatus(Long id,
                                                      DeploymentStatusUpdateRequest request,
                                                      String userEmail) {
        Deployment deployment = deploymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deployment", "id", id));

        DeploymentStatus newStatus;
        try {
            newStatus = DeploymentStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(
                    "Invalid status: " + request.getStatus() + ". Valid: PENDING, RUNNING, SUCCESS, FAILED");
        }

        // Validate state transition
        validateStateTransition(deployment.getDeploymentStatus(), newStatus);

        deployment.setDeploymentStatus(newStatus);
        if (request.getLogOutput() != null) {
            deployment.setLogOutput(request.getLogOutput());
        }
        if (newStatus == DeploymentStatus.SUCCESS || newStatus == DeploymentStatus.FAILED) {
            deployment.setCompletedAt(LocalDateTime.now());
        }

        Deployment updated = deploymentRepository.save(deployment);
        log.info("Deployment #{} status updated to {} by {}", id, newStatus, userEmail);

        auditLogService.log("STATUS_UPDATE", "DEPLOYMENT", id,
                userEmail, "Status changed to: " + newStatus);

        return mapToResponse(updated);
    }

    /**
     * Retrieves all deployments with optional filtering, pagination, and sorting.
     */
    @Transactional(readOnly = true)
    public PagedResponse<DeploymentResponse> getAllDeployments(
            String environment, String status, int page, int size, String sortBy, String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Environment env = null;
        DeploymentStatus stat = null;

        if (environment != null && !environment.isBlank()) {
            try {
                env = Environment.valueOf(environment.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid environment filter: " + environment);
            }
        }

        if (status != null && !status.isBlank()) {
            try {
                stat = DeploymentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status filter: " + status);
            }
        }

        Page<Deployment> deploymentPage = deploymentRepository.findByFilters(env, stat, pageable);
        return buildPagedResponse(deploymentPage);
    }

    /**
     * Retrieves deployments for a specific project.
     */
    @Transactional(readOnly = true)
    public PagedResponse<DeploymentResponse> getDeploymentsByProject(Long projectId, int page, int size) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project", "id", projectId);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("startedAt").descending());
        Page<Deployment> deploymentPage = deploymentRepository.findByProjectId(projectId, pageable);
        return buildPagedResponse(deploymentPage);
    }

    /**
     * Retrieves the most recent deployments for the activity feed.
     */
    @Transactional(readOnly = true)
    public List<DeploymentResponse> getRecentDeployments() {
        return deploymentRepository.findTop10ByOrderByStartedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ---- Private helper methods ----

    /**
     * Validates deployment state transitions.
     * Valid transitions: PENDING→RUNNING, RUNNING→SUCCESS, RUNNING→FAILED
     */
    private void validateStateTransition(DeploymentStatus current, DeploymentStatus target) {
        boolean valid = switch (current) {
            case PENDING -> target == DeploymentStatus.RUNNING;
            case RUNNING -> target == DeploymentStatus.SUCCESS || target == DeploymentStatus.FAILED;
            case SUCCESS, FAILED -> false; // Terminal states
        };

        if (!valid) {
            throw new InvalidDeploymentStateException(current.name(), target.name());
        }
    }

    private DeploymentResponse mapToResponse(Deployment deployment) {
        return DeploymentResponse.builder()
                .id(deployment.getId())
                .deploymentName(deployment.getDeploymentName())
                .deploymentVersion(deployment.getDeploymentVersion())
                .environment(deployment.getEnvironment().name())
                .deploymentStatus(deployment.getDeploymentStatus().name())
                .triggeredByName(deployment.getTriggeredBy().getFullName())
                .triggeredById(deployment.getTriggeredBy().getId())
                .projectId(deployment.getProject().getId())
                .projectName(deployment.getProject().getProjectName())
                .startedAt(deployment.getStartedAt())
                .completedAt(deployment.getCompletedAt())
                .logOutput(deployment.getLogOutput())
                .build();
    }

    private PagedResponse<DeploymentResponse> buildPagedResponse(Page<Deployment> page) {
        return PagedResponse.<DeploymentResponse>builder()
                .content(page.getContent().stream().map(this::mapToResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
