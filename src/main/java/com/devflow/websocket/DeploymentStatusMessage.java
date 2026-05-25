package com.devflow.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * WebSocket message payload for real-time deployment status updates.
 * Broadcast to all connected clients on the /topic/deployments channel.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeploymentStatusMessage {

    private Long deploymentId;
    private String status;
    private String environment;
    private String projectName;
    private String message;
    private LocalDateTime timestamp;
}
