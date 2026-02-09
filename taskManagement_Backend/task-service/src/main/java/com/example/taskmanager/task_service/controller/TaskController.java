package com.example.taskmanager.task_service.controller;

import com.example.taskmanager.task_service.dto.MemberTaskStats;
import com.example.taskmanager.task_service.dto.TaskReportResponse;
import com.example.taskmanager.task_service.dto.TaskRequest;
import com.example.taskmanager.task_service.model.Task;
import com.example.taskmanager.task_service.service.TaskService;
import com.example.taskmanager.task_service.service.TaskStatus;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

    @RestController
    @RequestMapping("/tasks")
    public class TaskController {

        @Autowired
        private TaskService taskService;

        // ---------------- CREATE TASK ----------------
        @PostMapping("/createTask")
        public Task createTask(@Valid @RequestBody TaskRequest request) {
            Task task = mapToEntity(request);
            return taskService.createTask(task, request.getTags());
        }

        // ---------------- GET ALL TASKS ----------------
        @GetMapping("/getAllTasks")
        public List<Task> getAllTasks() {
            return taskService.getAllTasks();
        }

        // ---------------- GET TASK BY ID ----------------
        @GetMapping("/getTaskById/{id}")
        public Task getTaskById(@PathVariable Long id) {
            return taskService.getTaskById(id)
                    .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        }

        // ---------------- UPDATE TASK ----------------
        @PutMapping("/updateTaskById/{id}")
        public Task updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
            Task taskDetails = mapToEntity(request);
            return taskService.updateTask(id, taskDetails, request.getTags());
        }

        // ---------------- DELETE TASK ----------------
        @DeleteMapping("/deleteTaskById/{id}")
        public String deleteTask(@PathVariable Long id) {
            taskService.deleteTask(id);
            return "Task deleted with id: " + id;
        }

        // ---------------- UPDATE STATUS ----------------
        @PatchMapping("/updateStatus/{id}")
        public Task updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
            String status = body.get("status");
            return taskService.updateTaskStatus(id, status);
        }

        // ---------------- SEARCH TASKS ----------------
        @GetMapping("/search")
        public List<Task> searchTasks(@RequestParam String title) {
            return taskService.searchByTitle(title);
        }

        // ---------------- FILTER TASKS ----------------
        @GetMapping("/filter")
        public List<Task> filterTasks(
                @RequestParam(required = false) String status,
                @RequestParam(required = false) String priority,
                @RequestParam(required = false) Long assigneeId,
                @RequestParam(required = false) String tag) {

            return taskService.filterTasks(status, priority, assigneeId, tag);
        }



        // ---------------- DASHBOARD STATS ----------------
        @GetMapping("/stats")
        public Map<String, Long> getTaskStats() {
            return taskService.getTaskStats();
        }

        // ---------------- HELPER METHOD ----------------

    private Task mapToEntity(TaskRequest request) {
        Task task = new Task();
        task.setTitle(request.getTitle());

        // ✅ convert string to enum-safe value
        try {
            task.setStatus(TaskStatus.fromString(request.getStatus()).name());
        } catch (IllegalArgumentException e) {
            // throw a proper 400 Bad Request instead of RuntimeException
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Status must be OPEN, IN_PROGRESS, or DONE"
            );
        }

        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setAssignees(request.getAssignees()); // ✅ ONLY SOURCE


        if (request.getDueDate() != null && !request.getDueDate().isEmpty()) {
            task.setDueDate(LocalDate.parse(request.getDueDate()));
        }

        task.setProjectId(request.getProjectId());
        return task;
    }

    @GetMapping("/byProject/{projectId}")
    public List<Task> getTasksByProject(@PathVariable Long projectId) {
        return taskService.getTasksByProject(projectId);
    }

    @PostMapping("/member-stats")
    public List<MemberTaskStats> getMemberStats(
            @RequestBody List<Long> projectIds) {

        return taskService.getMemberStatsByProjects(projectIds);
    }

    @GetMapping("/report")
    public List<TaskReportResponse> getTaskReport() {
        return taskService.getTaskReport();
    }

}
