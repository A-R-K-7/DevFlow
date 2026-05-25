package com.devflow.service;

import com.devflow.dto.response.DashboardStatsResponse;
import com.devflow.dto.response.DeploymentResponse;
import com.devflow.entity.Deployment;
import com.devflow.entity.enums.DeploymentStatus;
import com.devflow.repository.DeploymentRepository;
import com.devflow.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for aggregating dashboard analytics and platform statistics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final DeploymentRepository deploymentRepository;

    /**
     * Computes aggregate dashboard statistics.
     *
     * @return dashboard stats including totals, rates, and breakdowns
     */
    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        long totalProjects = projectRepository.count();
        long totalDeployments = deploymentRepository.count();
        long successCount = deploymentRepository.countByDeploymentStatus(DeploymentStatus.SUCCESS);
        long failedCount = deploymentRepository.countByDeploymentStatus(DeploymentStatus.FAILED);

        double successRate = totalDeployments > 0
                ? Math.round((double) successCount / totalDeployments * 10000.0) / 100.0
                : 0.0;
        double failureRate = totalDeployments > 0
                ? Math.round((double) failedCount / totalDeployments * 10000.0) / 100.0
                : 0.0;

        // Deployments by environment
        Map<String, Long> byEnvironment = new LinkedHashMap<>();
        deploymentRepository.countByEnvironmentGrouped().forEach(row -> {
            byEnvironment.put(row[0].toString(), (Long) row[1]);
        });

        // Deployments by status
        Map<String, Long> byStatus = new LinkedHashMap<>();
        deploymentRepository.countByStatusGrouped().forEach(row -> {
            byStatus.put(row[0].toString(), (Long) row[1]);
        });

        log.debug("Dashboard stats computed: {} projects, {} deployments, {}% success",
                totalProjects, totalDeployments, successRate);

        return DashboardStatsResponse.builder()
                .totalProjects(totalProjects)
                .totalDeployments(totalDeployments)
                .successRate(successRate)
                .failureRate(failureRate)
                .deploymentsByEnvironment(byEnvironment)
                .deploymentsByStatus(byStatus)
                .build();
    }

    /**
     * Retrieves recent deployment activity for the dashboard feed.
     *
     * @return list of the 10 most recent deployments
     */
    @Transactional(readOnly = true)
    public List<DeploymentResponse> getRecentActivity() {
        return deploymentRepository.findTop10ByOrderByStartedAtDesc()
                .stream()
                .map(this::mapToDeploymentResponse)
                .toList();
    }

    private DeploymentResponse mapToDeploymentResponse(Deployment deployment) {
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
                .build();
    }
}
