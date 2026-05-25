package com.devflow.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when an invalid deployment state transition is attempted.
 * For example, transitioning from FAILED to RUNNING.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidDeploymentStateException extends RuntimeException {

    public InvalidDeploymentStateException(String message) {
        super(message);
    }

    public InvalidDeploymentStateException(String currentState, String targetState) {
        super(String.format("Invalid state transition from '%s' to '%s'", currentState, targetState));
    }
}
