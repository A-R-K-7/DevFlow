package com.devflow.service;

import com.devflow.entity.AuditLog;
import com.devflow.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for recording and retrieving audit log entries.
 * All significant platform actions are logged for traceability.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Creates an audit log entry. Uses REQUIRES_NEW propagation to ensure
     * audit logs are persisted even if the calling transaction rolls back.
     *
     * @param action      the action performed (e.g., CREATE, UPDATE, DELETE, LOGIN)
     * @param entityType  the type of entity affected (e.g., PROJECT, DEPLOYMENT)
     * @param entityId    the ID of the affected entity
     * @param performedBy the email of the user who performed the action
     * @param details     additional details about the action
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entityType, Long entityId,
                    String performedBy, String details) {
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .performedBy(performedBy)
                .details(details)
                .build();

        auditLogRepository.save(auditLog);
        log.debug("Audit log recorded: {} on {} #{} by {}", action, entityType, entityId, performedBy);
    }

    /**
     * Retrieves the most recent audit log entries.
     *
     * @return list of the 20 most recent audit log entries
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getRecentActivity() {
        return auditLogRepository.findTop20ByOrderByTimestampDesc();
    }

    /**
     * Retrieves audit logs for a specific entity.
     *
     * @param entityType the type of entity
     * @param entityId   the entity ID
     * @return list of audit log entries for the entity
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getLogsForEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }
}
