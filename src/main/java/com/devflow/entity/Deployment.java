package com.devflow.entity;

import com.devflow.entity.enums.DeploymentStatus;
import com.devflow.entity.enums.Environment;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Represents a deployment event within a project.
 * Tracks the full lifecycle from PENDING through SUCCESS/FAILED.
 */
@Entity
@Table(name = "deployments", indexes = {
        @Index(name = "idx_deployment_status", columnList = "deploymentStatus"),
        @Index(name = "idx_deployment_environment", columnList = "environment"),
        @Index(name = "idx_deployment_started_at", columnList = "startedAt"),
        @Index(name = "idx_deployment_project", columnList = "project_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Deployment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String deploymentName;

    @Column(nullable = false, length = 50)
    private String deploymentVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private Environment environment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private DeploymentStatus deploymentStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triggered_by", nullable = false)
    private User triggeredBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String logOutput;
}
