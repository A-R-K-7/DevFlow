package com.devflow.controller;

import com.devflow.dto.response.ApiResponse;
import com.devflow.dto.response.DashboardStatsResponse;
import com.devflow.dto.response.DeploymentResponse;
import com.devflow.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for dashboard analytics and statistics.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Dashboard", description = "Analytics and statistics APIs")
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(
            summary = "Get dashboard statistics",
            description = "Returns aggregate platform statistics including total projects, " +
                    "total deployments, success/failure rates, and breakdowns by environment and status."
    )
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        DashboardStatsResponse stats = dashboardService.getStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved", stats));
    }

    @Operation(
            summary = "Get recent activity",
            description = "Returns the 10 most recent deployment activities across all projects."
    )
    @GetMapping("/activity")
    public ResponseEntity<ApiResponse<List<DeploymentResponse>>> getRecentActivity() {
        List<DeploymentResponse> activity = dashboardService.getRecentActivity();
        return ResponseEntity.ok(ApiResponse.success("Recent activity retrieved", activity));
    }
}
