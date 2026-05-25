package com.devflow.service;

import com.devflow.entity.Deployment;
import com.devflow.entity.enums.DeploymentStatus;
import com.devflow.repository.DeploymentRepository;
import com.devflow.websocket.DeploymentStatusMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

/**
 * Service that asynchronously simulates the deployment lifecycle.
 * Transitions through: PENDING → RUNNING → SUCCESS/FAILED
 * Sends real-time WebSocket notifications at each stage.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DeploymentSimulationService {

    private final DeploymentRepository deploymentRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final Random random = new Random();

    /**
     * Simulates a deployment lifecycle asynchronously.
     * <ul>
     *   <li>Waits 2 seconds, then transitions to RUNNING</li>
     *   <li>Waits 5 seconds, then transitions to SUCCESS (90%) or FAILED (10%)</li>
     * </ul>
     *
     * @param deploymentId the ID of the deployment to simulate
     */
    @Async
    public void simulateDeployment(Long deploymentId) {
        log.info("Starting deployment simulation for deployment #{}", deploymentId);

        try {
            // Phase 1: PENDING → RUNNING (2 second delay)
            Thread.sleep(2000);
            updateStatusAndNotify(deploymentId, DeploymentStatus.RUNNING,
                    "Deployment pipeline started. Building artifacts...");

            // Phase 2: RUNNING → SUCCESS/FAILED (5 second delay)
            Thread.sleep(5000);
            boolean success = random.nextInt(100) < 90; // 90% success rate
            DeploymentStatus finalStatus = success ? DeploymentStatus.SUCCESS : DeploymentStatus.FAILED;
            String message = success
                    ? "Deployment completed successfully. All health checks passed."
                    : "Deployment failed. Error: Build verification failed at step 3/5.";

            updateStatusAndNotify(deploymentId, finalStatus, message);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Deployment simulation interrupted for deployment #{}", deploymentId);
            updateStatusAndNotify(deploymentId, DeploymentStatus.FAILED,
                    "Deployment simulation was interrupted.");
        }
    }

    /**
     * Updates deployment status in the database and broadcasts via WebSocket.
     */
    @Transactional
    protected void updateStatusAndNotify(Long deploymentId, DeploymentStatus status, String message) {
        Deployment deployment = deploymentRepository.findById(deploymentId).orElse(null);
        if (deployment == null) {
            log.warn("Deployment #{} not found during simulation", deploymentId);
            return;
        }

        deployment.setDeploymentStatus(status);
        deployment.setLogOutput(message);

        if (status == DeploymentStatus.SUCCESS || status == DeploymentStatus.FAILED) {
            deployment.setCompletedAt(LocalDateTime.now());
        }

        deploymentRepository.save(deployment);
        log.info("Deployment #{} status updated to: {}", deploymentId, status);

        // Broadcast via WebSocket
        DeploymentStatusMessage wsMessage = DeploymentStatusMessage.builder()
                .deploymentId(deploymentId)
                .status(status.name())
                .environment(deployment.getEnvironment().name())
                .projectName(deployment.getProject().getProjectName())
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/deployments", wsMessage);
        log.debug("WebSocket notification sent for deployment #{}", deploymentId);
    }
}
