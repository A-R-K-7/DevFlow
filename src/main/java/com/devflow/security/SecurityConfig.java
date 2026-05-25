package com.devflow.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Central Spring Security configuration.
 *
 * <p>
 * Configures stateless JWT authentication, CSRF protection (disabled for REST
 * APIs),
 * role-based endpoint authorization, and the custom JWT filter chain.
 * </p>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomUserDetailsService customUserDetailsService;

    /**
     * Configures the HTTP security filter chain.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for stateless REST API
                .csrf(AbstractHttpConfigurer::disable)

                // Allow H2 console frames in dev mode
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))

                // Set custom entry point for 401 responses
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint))

                // Stateless session management
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Endpoint authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/api-docs/**", "/v3/api-docs/**")
                        .permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/", "/index.html", "/css/**", "/js/**", "/assets/**", "/favicon.ico",
                                "/favicon.svg", "/icons.svg")
                        .permitAll()

                        // Project management
                        .requestMatchers(HttpMethod.POST, "/api/projects/**")
                        .hasAnyRole("ADMIN", "DEVELOPER")
                        .requestMatchers(HttpMethod.DELETE, "/api/projects/**")
                        .hasRole("ADMIN")

                        // Deployment management
                        .requestMatchers(HttpMethod.PUT, "/api/deployments/*/status")
                        .hasAnyRole("ADMIN", "RELEASE_MANAGER")

                        // Team management
                        .requestMatchers(HttpMethod.POST, "/api/teams/**")
                        .hasAnyRole("ADMIN", "RELEASE_MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/teams/**")
                        .hasRole("ADMIN")

                        // All other endpoints require authentication
                        .anyRequest().authenticated());

        // Add JWT filter before Spring's default auth filter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configures the DAO authentication provider with BCrypt password encoding.
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Exposes the AuthenticationManager bean.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * BCrypt password encoder bean.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
