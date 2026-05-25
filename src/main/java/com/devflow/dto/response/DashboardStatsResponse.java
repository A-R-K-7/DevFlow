package com.devflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Response DTO for dashboard analytics and statistics.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private long totalProjects;
    private long totalDeployments;
    private double successRate;
    private double failureRate;
    private Map<String, Long> deploymentsByEnvironment;
    private Map<String, Long> deploymentsByStatus;
}
