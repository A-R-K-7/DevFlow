package com.devflow.entity.enums;

/**
 * Represents the lifecycle states of a deployment.
 */
public enum DeploymentStatus {

    /** Deployment has been created but not yet started. */
    PENDING,

    /** Deployment is currently in progress. */
    RUNNING,

    /** Deployment completed successfully. */
    SUCCESS,

    /** Deployment encountered errors and failed. */
    FAILED
}
