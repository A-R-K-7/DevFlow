package com.devflow.repository;

import com.devflow.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for TeamMember entity operations.
 */
@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    List<TeamMember> findByProjectId(Long projectId);

    List<TeamMember> findByUserId(Long userId);

    boolean existsByUserIdAndProjectId(Long userId, Long projectId);
}
