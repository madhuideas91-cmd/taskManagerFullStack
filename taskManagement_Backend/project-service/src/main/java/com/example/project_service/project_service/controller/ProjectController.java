package com.example.project_service.project_service.controller;

import com.example.project_service.project_service.Entity.Project;
import com.example.project_service.project_service.dto.ProjectRequest;
import com.example.project_service.project_service.dto.ProjectResponse;
import com.example.project_service.project_service.dto.TaskDTO;
import com.example.project_service.project_service.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/projects")
public class    ProjectController {

    private final ProjectService service;

    public ProjectController(ProjectService service) {
        this.service = service;
    }

    // CREATE
    @PostMapping("/create")
    public ResponseEntity<ProjectResponse> createProject(@RequestBody Project project) {
        // 🔒 ENFORCE teamId (this was missing)
        if (project.getTeamId() == null) {
            throw new IllegalArgumentException("teamId is required to create a project");
        }
        Project saved = service.createProject(project);
        ProjectResponse pr = new ProjectResponse();
        pr.setId(saved.getId());
        pr.setName(saved.getName());
        pr.setDescription(saved.getDescription());
        pr.setProgress(0);
        pr.setStatus("On Track");
        pr.setStartDate(saved.getCreatedAt().toString());
        pr.setEndDate(LocalDate.now().plusDays(30).toString());
        pr.setTeam(List.of("avatar1.png", "avatar2.png"));
        return ResponseEntity.ok(pr);
    }


    // GET ALL
    @GetMapping("/getAllProjects")
    public List<Project> getAllProjects() {
        return service.getAllProjects();
    }

    // GET ONE
    @GetMapping("/{id}")
    public Project getProject(@PathVariable Long id) {
        return service.getProject(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Project updateProject(@PathVariable Long id, @RequestBody ProjectRequest req) {
        Project p = new Project();
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        return service.updateProject(id, p);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.deleteProject(id);
        return "Project deleted: " + id;
    }

    // GET TASKS OF PROJECT
    @GetMapping("/{id}/tasks")
    public List<TaskDTO> getTasksByProject(@PathVariable Long id) {
        return service.getTasksByProject(id);
    }

    @GetMapping("/getAllProjectsWithProgress")
    public List<ProjectResponse> getAllProjectsWithProgress() {
        return service.getAllProjectsWithProgress();
    }

    @GetMapping("/team/{teamId}/project-ids")
    public List<Long> getProjectIdsByTeam(@PathVariable Long teamId) {
        return service.getProjectIdsByTeam(teamId);
    }


}
