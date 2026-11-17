
package com.bugtracker.controller;

import com.bugtracker.dto.ProjectRequest;
import com.bugtracker.dto.ProjectResponse;
import com.bugtracker.entity.Project;
import com.bugtracker.service.ProjectService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.stream.Collectors;

@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // Create a new project
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody ProjectRequest request,
            Authentication authentication) {

        Project project = projectService.createProject(
                request.getName(),
                request.getDescription(),
                authentication.getName()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertToResponse(project));
    }

    // Get projects owned by logged-in user
    @GetMapping("/my-projects")
    public ResponseEntity<Set<ProjectResponse>> getMyProjects(
            Authentication authentication) {

        Set<ProjectResponse> projects = projectService
                .getMyProjects(authentication.getName())
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toSet());

        return ResponseEntity.ok(projects);
    }

    // Get projects where logged-in user is a member
    @GetMapping("/member-projects")
    public ResponseEntity<Set<ProjectResponse>> getMemberProjects(
            Authentication authentication) {

        Set<ProjectResponse> projects = projectService
                .getProjectsAsMember(authentication.getName())
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toSet());

        return ResponseEntity.ok(projects);
    }

    // Add a member (only project owner can do this)
    @PostMapping("/{projectId}/members")
    public ResponseEntity<ProjectResponse> addMember(
            @PathVariable Long projectId,
            @RequestParam String email,
            Authentication authentication) {

        Project project = projectService.addMember(
                projectId,
                email,
                authentication.getName()
        );

        return ResponseEntity.ok(convertToResponse(project));
    }

    // Get project by ID (only project members can view it)
    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable Long projectId,
            Authentication authentication) {

        Project project = projectService.getProjectById(
                projectId,
                authentication.getName()
        );

        return ResponseEntity.ok(convertToResponse(project));
    }

    // Convert Project entity into ProjectResponse DTO
    private ProjectResponse convertToResponse(Project project) {

        Set<String> members = project.getMembers()
                .stream()
                .map(user -> user.getEmail())
                .collect(Collectors.toSet());

        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getOwner().getName(),
                members,
                project.getCreatedAt()
        );
    }
}
