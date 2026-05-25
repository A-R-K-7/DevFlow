package com.devflow.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI/Swagger configuration for DevFlow API documentation.
 * Includes JWT Bearer authentication support in the Swagger UI.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI devFlowOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("DevFlow API")
                        .description("CI/CD Deployment Tracking and Release Management Platform API. " +
                                "Manage software projects, track deployments, monitor statuses, " +
                                "and collaborate with teams.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("DevFlow Team")
                                .email("support@devflow.io"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development"),
                        new Server().url("https://api.devflow.io").description("Production")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token obtained from /api/auth/login")));
    }
}
