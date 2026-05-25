package com.devflow.repository;

import com.devflow.entity.Deployment;
import com.devflow.entity.enums.DeploymentStatus;
import com.devflow.entity.enums.Environment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Deployment entity operations with advanced filtering and analytics queries.
 */
@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, Long> {

    Page<Deployment> findByProjectId(Long projectId, Pageable pageable);

    Page<Deployment> findByEnvironment(Environment environment, Pageable pageable);

    Page<Deployment> findByDeploymentStatus(DeploymentStatus status, Pageable pageable);

    Page<Deployment> findByEnvironmentAndDeploymentStatus(
            Environment environment, DeploymentStatus status, Pageable pageable);

    List<Deployment> findTop10ByOrderByStartedAtDesc();

    long countByDeploymentStatus(DeploymentStatus status);

    long countByEnvironment(Environment environment);

    @Query("SELECT d.deploymentStatus, COUNT(d) FROM Deployment d GROUP BY d.deploymentStatus")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT d.environment, COUNT(d) FROM Deployment d GROUP BY d.environment")
    List<Object[]> countByEnvironmentGrouped();

    @Query("SELECT d FROM Deployment d WHERE " +
            "(:environment IS NULL OR d.environment = :environment) AND " +
            "(:status IS NULL OR d.deploymentStatus = :status)")
    Page<Deployment> findByFilters(
            @Param("environment") Environment environment,
            @Param("status") DeploymentStatus status,
            Pageable pageable);
}
