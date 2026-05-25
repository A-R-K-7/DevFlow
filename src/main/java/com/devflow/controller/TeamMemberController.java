package com.devflow.controller;

import com.devflow.dto.request.TeamMemberRequest;
import com.devflow.dto.response.ApiResponse;
import com.devflow.dto.response.TeamMemberResponse;
import com.devflow.service.TeamMemberService;
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
 * REST controller for team collaboration operations.
 * Manages user assignments to projects.
 */
@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Team Management", description = "Team member assignment and collaboration APIs")
public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    @Operation(
            summary = "Assign user to project",
            description = "Assigns a user to a project with a specific role. Requires ADMIN or RELEASE_MANAGER role."
    )
    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<TeamMemberResponse>> assignMember(
            @Valid @RequestBody TeamMemberRequest request,
            Authentication authentication) {
        TeamMemberResponse member = teamMemberService.assignMember(request, authentication.getName());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Team member assigned successfully", member));
    }

    @Operation(
            summary = "Remove team member assignment",
            description = "Removes a user's assignment from a project. Requires ADMIN role."
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long id,
            Authentication authentication) {
        teamMemberService.removeMember(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Team member removed successfully"));
    }

    @Operation(
            summary = "Get project team members",
            description = "Retrieves all team members assigned to a specific project."
    )
    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<TeamMemberResponse>>> getProjectTeamMembers(
            @PathVariable Long projectId) {
        List<TeamMemberResponse> members = teamMemberService.getProjectTeamMembers(projectId);
        return ResponseEntity.ok(ApiResponse.success("Team members retrieved successfully", members));
    }

    @Operation(
            summary = "Get user's project assignments",
            description = "Retrieves all project assignments for a specific user."
    )
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<TeamMemberResponse>>> getUserAssignments(
            @PathVariable Long userId) {
        List<TeamMemberResponse> assignments = teamMemberService.getUserAssignments(userId);
        return ResponseEntity.ok(ApiResponse.success("User assignments retrieved", assignments));
    }
}
