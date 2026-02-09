package com.example.project_service.project_service.service;

import com.example.project_service.project_service.Entity.Project;
import com.example.project_service.project_service.dto.ProjectResponse;
import com.example.project_service.project_service.dto.TaskDTO;
import com.example.project_service.project_service.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository repo;
    private final WebClient webClient;

    public ProjectService(ProjectRepository repo,WebClient.Builder webClientBuilder) {
        this.repo = repo;
        this.webClient = webClientBuilder
//                .baseUrl("http://task-service:8082") // <-- only change
                .baseUrl("lb://task-service") // ✅ Eureka lookup
                .build();
    }

    // CREATE
    public Project createProject(Project p) {
        return repo.save(p);
    }

    // GET ALL
    public List<Project> getAllProjects() {
        return repo.findAll();
    }

    // GET ONE
    public Project getProject(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
    }

    // UPDATE
    public Project updateProject(Long id, Project newData) {
        Project p = getProject(id);
        p.setName(newData.getName());
        p.setDescription(newData.getDescription());
        return repo.save(p);
    }

    // DELETE
    public void deleteProject(Long id) {
        repo.deleteById(id);
    }

    // CALL TASK-SERVICE
    public List<TaskDTO> getTasksByProject(Long projectId) {
        return webClient.get()
//                .uri("http://localhost:8082/tasks/byProject/" + projectId)
                .uri("/tasks/byProject/" + projectId) // ✅ RELATIVE
                .retrieve()
                .bodyToFlux(TaskDTO.class)
                .collectList()
                .block();
    }

    public List<ProjectResponse> getAllProjectsWithProgress() {

        List<Project> projects = repo.findAll();
        List<ProjectResponse> response = new ArrayList<>();

        for (Project p : projects) {

            // Get tasks from task-service
            List<TaskDTO> tasks = webClient.get()
//                    .uri("http://localhost:8082/tasks/byProject/" + p.getId())
                    .uri("/tasks/byProject/" + p.getId()) // ✅ FIXED
                    .retrieve()
                    .bodyToFlux(TaskDTO.class)
                    .collectList()
                    .block();

            int total = tasks.size();
            int completed = (int) tasks.stream()
                    .filter(t -> t.getStatus().equalsIgnoreCase("Completed")
                            || t.getStatus().equalsIgnoreCase("DONE"))
                    .count();

            int progress = (total == 0) ? 0 : (completed * 100 / total);

            ProjectResponse pr = new ProjectResponse();
            pr.setId(p.getId());
            pr.setName(p.getName());
            pr.setDescription(p.getDescription());
            pr.setProgress(progress);
            pr.setStatus(progress == 100 ? "Completed" :
                    progress >= 50 ? "On Track" : "Delayed");
            pr.setStartDate(p.getCreatedAt().toString());
            pr.setEndDate(LocalDate.now().plusDays(30).toString());
            pr.setTeam(List.of("avatar1.png", "avatar2.png"));

            response.add(pr);
        }

        return response;
    }

    public List<Long> getProjectIdsByTeam(Long teamId) {
        return repo.findByTeamId(teamId)
                .stream()
                .map(Project::getId)
                .toList();
    }
}
