package com.devflow.entity.enums;

/**
 * Defines the roles available within the DevFlow platform.
 * Used for role-based access control (RBAC).
 */
public enum Role {

    /** Full system access — manage users, projects, deployments, and settings. */
    ADMIN,

    /** Can create projects and trigger deployments. */
    DEVELOPER,

    /** Can approve/reject deployments and manage releases. */
    RELEASE_MANAGER
}
