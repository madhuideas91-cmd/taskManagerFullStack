package com.example.taskmanager.task_service.repository;

import com.example.taskmanager.task_service.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // Search by title
    List<Task> findByTitleContainingIgnoreCase(String title);

    // Count by status for dashboard
    Long countByStatus(String status);

    // Count by priority for dashboard
    Long countByPriority(String priority);

    // Filter by tags (tasks containing a specific tag)
    @Query("SELECT t FROM Task t JOIN t.tags tag WHERE tag = :tag")
    List<Task> findByTag(@Param("tag") String tag);

    List<Task> findByProjectId(Long projectId);

    @Query("""
SELECT a,
       SUM(CASE WHEN t.status = 'OPEN' THEN 1 ELSE 0 END),
       SUM(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 ELSE 0 END),
       SUM(CASE WHEN t.status = 'DONE' THEN 1 ELSE 0 END)
FROM Task t
JOIN t.assignees a
WHERE t.projectId IN :projectIds
  AND a IS NOT NULL
GROUP BY a
""")
    List<Object[]> countTasksByAssigneeAndProjects(
            @Param("projectIds") List<Long> projectIds
    );


}
