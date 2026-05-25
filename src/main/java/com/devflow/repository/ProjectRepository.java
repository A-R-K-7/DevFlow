package com.devflow.repository;

import com.devflow.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Project entity operations with search and pagination support.
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByCreatedById(Long userId);

    @Query("SELECT p FROM Project p WHERE " +
            "LOWER(p.projectName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Project> searchProjects(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.createdBy")
    Page<Project> findAllWithCreator(Pageable pageable);
}
