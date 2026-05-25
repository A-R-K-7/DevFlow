package com.devflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * DevFlow - CI/CD Deployment Tracking and Release Management Platform.
 *
 * <p>Enterprise-grade Spring Boot application for managing software projects,
 * tracking deployments/releases, monitoring deployment statuses, managing
 * environments, and facilitating team collaboration.</p>
 *
 * @author DevFlow Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class DevFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(DevFlowApplication.class, args);
    }
}
