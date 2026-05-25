package com.devflow.service;

import com.devflow.dto.request.TeamMemberRequest;
import com.devflow.dto.response.TeamMemberResponse;
import com.devflow.entity.Project;
import com.devflow.entity.TeamMember;
import com.devflow.entity.User;
import com.devflow.exception.DuplicateResourceException;
import com.devflow.exception.ResourceNotFoundException;
import com.devflow.repository.ProjectRepository;
import com.devflow.repository.TeamMemberRepository;
import com.devflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing team member assignments to projects.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TeamMemberService {

    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final AuditLogService auditLogService;

    /**
     * Assigns a user to a project with a specific role.
     *
     * @param request       the team member assignment request
     * @param performedBy   the email of the user performing the assignment
     * @return the team member response
     */
    @Transactional
    public TeamMemberResponse assignMember(TeamMemberRequest request, String performedBy) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        // Check for duplicate assignment
        if (teamMemberRepository.existsByUserIdAndProjectId(request.getUserId(), request.getProjectId())) {
            throw new DuplicateResourceException(
                    "User is already assigned to this project");
        }

        TeamMember teamMember = TeamMember.builder()
                .user(user)
                .project(project)
                .projectRole(request.getProjectRole())
                .build();

        TeamMember saved = teamMemberRepository.save(teamMember);

        // Also add to project's team members set
        project.getTeamMembers().add(user);
        projectRepository.save(project);

        log.info("User '{}' assigned to project '{}' as {} by {}",
                user.getFullName(), project.getProjectName(), request.getProjectRole(), performedBy);

        auditLogService.log("ASSIGN", "TEAM_MEMBER", saved.getId(),
                performedBy, String.format("Assigned %s to project %s as %s",
                        user.getFullName(), project.getProjectName(), request.getProjectRole()));

        return mapToResponse(saved);
    }

    /**
     * Removes a team member assignment.
     *
     * @param id          the team member assignment ID
     * @param performedBy the email of the user performing the removal
     */
    @Transactional
    public void removeMember(Long id, String performedBy) {
        TeamMember teamMember = teamMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", "id", id));

        // Remove from project's team members set
        Project project = teamMember.getProject();
        project.getTeamMembers().remove(teamMember.getUser());
        projectRepository.save(project);

        teamMemberRepository.delete(teamMember);

        log.info("Team member assignment #{} removed by {}", id, performedBy);

        auditLogService.log("REMOVE", "TEAM_MEMBER", id,
                performedBy, String.format("Removed %s from project %s",
                        teamMember.getUser().getFullName(), project.getProjectName()));
    }

    /**
     * Retrieves all team members for a project.
     */
    @Transactional(readOnly = true)
    public List<TeamMemberResponse> getProjectTeamMembers(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project", "id", projectId);
        }
        return teamMemberRepository.findByProjectId(projectId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Retrieves all project assignments for a user.
     */
    @Transactional(readOnly = true)
    public List<TeamMemberResponse> getUserAssignments(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return teamMemberRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ---- Private helper methods ----

    private TeamMemberResponse mapToResponse(TeamMember teamMember) {
        return TeamMemberResponse.builder()
                .id(teamMember.getId())
                .userId(teamMember.getUser().getId())
                .userName(teamMember.getUser().getFullName())
                .userEmail(teamMember.getUser().getEmail())
                .userRole(teamMember.getUser().getRole().name())
                .projectId(teamMember.getProject().getId())
                .projectName(teamMember.getProject().getProjectName())
                .projectRole(teamMember.getProjectRole())
                .assignedAt(teamMember.getAssignedAt())
                .build();
    }
}
