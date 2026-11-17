
package com.bugtracker.service;

import com.bugtracker.entity.Project;
import com.bugtracker.entity.User;
import com.bugtracker.repository.ProjectRepository;
import com.bugtracker.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            UserRepository userRepository) {

        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    // Create a new project
    public Project createProject(
            String name,
            String description,
            String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Project project = new Project();

        project.setName(name);
        project.setDescription(description);
        project.setOwner(owner);

        project.setMembers(new HashSet<>());
        project.getMembers().add(owner);

        return projectRepository.save(project);
    }

    // Get projects owned by the logged-in user
    public List<Project> getMyProjects(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return projectRepository.findByOwner(user);
    }

    // Get projects where the user is a member
    public List<Project> getProjectsAsMember(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return projectRepository.findByMembersContaining(user);
    }

    // Add a member (only project owner can add members)
    public Project addMember(
            Long projectId,
            String memberEmail,
            String requesterEmail) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        if (!project.getOwner().getEmail().equals(requesterEmail)) {
            throw new RuntimeException(
                    "Only the project owner can add members");
        }

        User member = userRepository.findByEmail(memberEmail)
                .orElseThrow(() ->
                        new RuntimeException("Member not found"));

        project.getMembers().add(member);

        return projectRepository.save(project);
    }

    // Get a project by ID (only project members can view it)
    public Project getProjectById(
            Long projectId,
            String requesterEmail) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        boolean isMember = project.getMembers().stream()
                .anyMatch(member ->
                        member.getEmail().equals(requesterEmail));

        if (!isMember) {
            throw new RuntimeException(
                    "You are not authorized to view this project");
        }

        return project;
    }
}
