package com.devflow.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

/**
 * WebSocket controller for handling deployment-related messages.
 * Clients can subscribe to /topic/deployments for real-time updates.
 */
@Controller
@Slf4j
public class DeploymentWebSocketHandler {

    /**
     * Handles incoming WebSocket messages and broadcasts deployment status.
     * Client sends to: /app/deployment-status
     * Broadcast to: /topic/deployments
     *
     * @param message the deployment status message
     * @return the message to broadcast to all subscribers
     */
    @MessageMapping("/deployment-status")
    @SendTo("/topic/deployments")
    public DeploymentStatusMessage handleDeploymentStatus(DeploymentStatusMessage message) {
        log.info("WebSocket message received for deployment #{}: {}",
                message.getDeploymentId(), message.getStatus());
        return message;
    }
}
