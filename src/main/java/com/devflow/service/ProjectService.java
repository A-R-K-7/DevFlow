package com.devflow.service;

import com.devflow.dto.request.ProjectRequest;
import com.devflow.dto.response.PagedResponse;
import com.devflow.dto.response.ProjectResponse;
import com.devflow.entity.Project;
import com.devflow.entity.User;
import com.devflow.exception.ResourceNotFoundException;
import com.devflow.exception.UnauthorizedException;
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

/**
 * Service for managing software projects.
 * Handles CRUD operations, search, pagination, and authorization checks.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    /**
     * Creates a new project.
     *
     * @param request   the project creation request
     * @param userEmail the email of the authenticated user
     * @return the created project response
     */
    @Transactional
    public ProjectResponse createProject(ProjectRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Project project = Project.builder()
                .projectName(request.getProjectName())
                .description(request.getDescription())
                .repositoryUrl(request.getRepositoryUrl())
                .createdBy(user)
                .build();

        Project savedProject = projectRepository.save(project);
        log.info("Project created: '{}' by {}", savedProject.getProjectName(), userEmail);

        auditLogService.log("CREATE", "PROJECT", savedProject.getId(),
                userEmail, "Created project: " + savedProject.getProjectName());

        return mapToResponse(savedProject);
    }

    /**
     * Retrieves all projects with pagination and sorting.
     */
    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> getAllProjects(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Project> projectPage = projectRepository.findAll(pageable);

        return buildPagedResponse(projectPage);
    }

    /**
     * Retrieves a project by its ID.
     */
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
        return mapToResponse(project);
    }

    /**
     * Updates an existing project. Only the creator or ADMIN can update.
     */
    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request, String userEmail) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Authorization: only creator or ADMIN
        if (!project.getCreatedBy().getId().equals(currentUser.getId())
                && !currentUser.getRole().name().equals("ADMIN")) {
            throw new UnauthorizedException("You are not authorized to update this project");
        }

        project.setProjectName(request.getProjectName());
        project.setDescription(request.getDescription());
        project.setRepositoryUrl(request.getRepositoryUrl());

        Project updatedProject = projectRepository.save(project);
        log.info("Project updated: '{}' by {}", updatedProject.getProjectName(), userEmail);

        auditLogService.log("UPDATE", "PROJECT", updatedProject.getId(),
                userEmail, "Updated project: " + updatedProject.getProjectName());

        return mapToResponse(updatedProject);
    }

    /**
     * Deletes a project. Only ADMIN can delete.
     */
    @Transactional
    public void deleteProject(Long id, String userEmail) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        projectRepository.delete(project);
        log.info("Project deleted: '{}' by {}", project.getProjectName(), userEmail);

        auditLogService.log("DELETE", "PROJECT", id,
                userEmail, "Deleted project: " + project.getProjectName());
    }

    /**
     * Searches projects by keyword in name or description.
     */
    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> searchProjects(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Project> projectPage = projectRepository.searchProjects(keyword, pageable);
        return buildPagedResponse(projectPage);
    }

    // ---- Private helper methods ----

    private ProjectResponse mapToResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .projectName(project.getProjectName())
                .description(project.getDescription())
                .repositoryUrl(project.getRepositoryUrl())
                .createdByName(project.getCreatedBy().getFullName())
                .createdById(project.getCreatedBy().getId())
                .deploymentCount(project.getDeployments() != null ? project.getDeployments().size() : 0)
                .teamMemberCount(project.getTeamMembers() != null ? project.getTeamMembers().size() : 0)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    private PagedResponse<ProjectResponse> buildPagedResponse(Page<Project> projectPage) {
        return PagedResponse.<ProjectResponse>builder()
                .content(projectPage.getContent().stream().map(this::mapToResponse).toList())
                .page(projectPage.getNumber())
                .size(projectPage.getSize())
                .totalElements(projectPage.getTotalElements())
                .totalPages(projectPage.getTotalPages())
                .last(projectPage.isLast())
                .build();
    }
}
