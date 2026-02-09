package com.example.taskmanager.task_service.service;


import com.example.taskmanager.task_service.dto.MemberTaskStats;
import com.example.taskmanager.task_service.dto.TaskReportResponse;
import com.example.taskmanager.task_service.model.Task;
import com.example.taskmanager.task_service.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

    @Service
    public class TaskService {

        @Autowired
        private KafkaTemplate<String, String> kafkaTemplate;

        @Autowired
        private TaskRepository taskRepository;


        // ---------------- CREATE TASK ----------------
    //    public Task createTask(Task task, Set<String> tags) {
    //        if (tags != null) task.setTags(tags);
    //        Task saved = taskRepository.save(task);
    //
    //        kafkaTemplate.send("task-created", saved.getProjectId().toString());
    //        return saved;
    //    }


        // ---------------- CREATE TASK ----------------
        public Task createTask(Task task, Set<String> tags) {
            if (tags != null) task.setTags(tags);

            Task saved = taskRepository.save(task);

            // ✅ FIX: avoid NullPointerException
            if (saved.getProjectId() != null) {
                kafkaTemplate.send(
                        "task-created",
                        saved.getProjectId().toString()
                );
            }

            return saved;
        }

        // ---------------- GET ALL TASKS ----------------
        public List<Task> getAllTasks() {
            return taskRepository.findAll();
        }

        // ---------------- GET TASK BY ID ----------------
        public Optional<Task> getTaskById(Long id) {
            return taskRepository.findById(id);
        }

        // ---------------- UPDATE TASK ----------------
        public Task updateTask(Long id, Task updatedTask, Set<String> tags) {
            Task t = taskRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            t.setTitle(updatedTask.getTitle());
            t.setStatus(updatedTask.getStatus());
            t.setDescription(updatedTask.getDescription());
            t.setPriority(updatedTask.getPriority());
            t.setAssignees(updatedTask.getAssignees()); // ✅ REQUIRE
            t.setDueDate(updatedTask.getDueDate());
            t.setProjectId(updatedTask.getProjectId());
            if (tags != null) t.setTags(tags);
            kafkaTemplate.send("task-updated", t.getProjectId().toString());


            return taskRepository.save(t);
        }


        // ---------------- DELETE TASK ----------------
        public void deleteTask(Long id) {
            Task task = taskRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            taskRepository.deleteById(id);

            kafkaTemplate.send("task-deleted", task.getProjectId().toString());
        }


        // ---------------- UPDATE STATUS ----------------
        public Task updateTaskStatus(Long id, String status) {
            Task t = taskRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            t.setStatus(status);
            return taskRepository.save(t);
        }

        // ---------------- SEARCH TASKS ----------------
        public List<Task> searchByTitle(String title) {
            return taskRepository.findByTitleContainingIgnoreCase(title);
        }

        // ---------------- FILTER TASKS ----------------
        public List<Task> filterTasks(
                String status,
                String priority,
                Long assigneeId,
                String tag) {

            return taskRepository.findAll().stream()
                    .filter(t ->
                            (status == null || t.getStatus().equalsIgnoreCase(status)) &&
                                    (priority == null || t.getPriority().equalsIgnoreCase(priority)) &&
                                    (assigneeId == null || t.getAssignees().contains(assigneeId)) &&
                                    (tag == null || t.getTags().contains(tag))
                    )
                    .collect(Collectors.toList());
        }




        // ---------------- DASHBOARD STATS ----------------
        public Map<String, Long> getTaskStats() {
            Map<String, Long> stats = new HashMap<>();
            stats.put("todo", taskRepository.countByStatus("Todo"));
            stats.put("inProgress", taskRepository.countByStatus("In Progress"));
            stats.put("done", taskRepository.countByStatus("Done"));
            stats.put("highPriority", taskRepository.countByPriority("High"));
            return stats;
        }
        public List<Task> getTasksByProject(Long projectId) {
            return taskRepository.findByProjectId(projectId);
        }

        public List<MemberTaskStats> getMemberStatsByProjects(List<Long> projectIds) {

            List<Object[]> rows = taskRepository
                    .countTasksByAssigneeAndProjects(projectIds);

            List<MemberTaskStats> result = new ArrayList<>();

            for (Object[] r : rows) {
                if (r[0] == null) continue; // safety guard

                MemberTaskStats s = new MemberTaskStats();
                s.setUserId(((Number) r[0]).longValue());
                s.setOpen(((Number) r[1]).longValue());
                s.setInProgress(((Number) r[2]).longValue());
                s.setDone(((Number) r[3]).longValue());
                result.add(s);
            }
            return result;
        }

        public List<TaskReportResponse> getTaskReport() {
            List<Task> allTasks = getAllTasks(); // reuse existing method

            Map<Long, TaskReportResponse> reportMap = new HashMap<>();

            for (Task t : allTasks) {
                Long projectId = t.getProjectId();
                if (projectId == null) continue;

                TaskReportResponse report = reportMap.getOrDefault(projectId, new TaskReportResponse(projectId, 0, 0, 0));
                switch (t.getStatus()) {
                    case "OPEN" -> report.setOpen(report.getOpen() + 1);
                    case "IN_PROGRESS" -> report.setInProgress(report.getInProgress() + 1);
                    case "DONE" -> report.setDone(report.getDone() + 1);
                }
                reportMap.put(projectId, report);
            }

            return new ArrayList<>(reportMap.values());
        }
    }
