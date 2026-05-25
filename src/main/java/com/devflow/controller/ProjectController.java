package com.devflow.controller;

import com.devflow.dto.request.ProjectRequest;
import com.devflow.dto.response.ApiResponse;
import com.devflow.dto.response.PagedResponse;
import com.devflow.dto.response.ProjectResponse;
import com.devflow.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for project management operations.
 * Supports CRUD, search, and pagination.
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Projects", description = "Project management APIs")
public class ProjectController {

    private final ProjectService projectService;

    @Operation(summary = "Create a new project", description = "Creates a new project. Requires ADMIN or DEVELOPER role.")
    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody ProjectRequest request,
            Authentication authentication) {
        ProjectResponse project = projectService.createProject(request, authentication.getName());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created successfully", project));
    }

    @Operation(summary = "Get all projects", description = "Retrieves all projects with pagination and sorting.")
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ProjectResponse>>> getAllProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        PagedResponse<ProjectResponse> projects = projectService.getAllProjects(page, size, sortBy, direction);
        return ResponseEntity.ok(ApiResponse.success("Projects retrieved successfully", projects));
    }

    @Operation(summary = "Get project by ID", description = "Retrieves a specific project by its ID.")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(@PathVariable Long id) {
        ProjectResponse project = projectService.getProjectById(id);
        return ResponseEntity.ok(ApiResponse.success("Project retrieved successfully", project));
    }

    @Operation(summary = "Update a project", description = "Updates an existing project. Only the creator or ADMIN can update.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request,
            Authentication authentication) {
        ProjectResponse project = projectService.updateProject(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Project updated successfully", project));
    }

    @Operation(summary = "Delete a project", description = "Deletes a project. Requires ADMIN role.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable Long id,
            Authentication authentication) {
        projectService.deleteProject(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Project deleted successfully"));
    }

    @Operation(summary = "Search projects", description = "Searches projects by keyword in name or description.")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PagedResponse<ProjectResponse>>> searchProjects(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<ProjectResponse> projects = projectService.searchProjects(keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved", projects));
    }
}
