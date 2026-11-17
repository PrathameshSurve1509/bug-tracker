
package com.bugtracker.service;

import com.bugtracker.dto.UpdateTicketStatusRequest;
import com.bugtracker.dto.TicketRequest;
import com.bugtracker.dto.UpdateTicketRequest;

import com.bugtracker.entity.Project;
import com.bugtracker.entity.Ticket;
import com.bugtracker.entity.User;

import com.bugtracker.enums.TicketStatus;
import com.bugtracker.enums.TicketPriority;

import com.bugtracker.repository.ProjectRepository;
import com.bugtracker.repository.TicketRepository;
import com.bugtracker.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TicketService(
            TicketRepository ticketRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository) {

        this.ticketRepository = ticketRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    private boolean hasProjectAccess(Project project, String email) {

        boolean isOwner = project.getOwner() != null
                && project.getOwner().getEmail().equalsIgnoreCase(email);

        boolean isMember = project.getMembers().stream()
                .anyMatch(member ->
                        member.getEmail().equalsIgnoreCase(email));

        return isOwner || isMember;
    }

    // Create a new ticket
    public Ticket createTicket(TicketRequest request, String creatorEmail) {

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!hasProjectAccess(project, creatorEmail)) {
            throw new RuntimeException("Only project members can create tickets");
        }

        Ticket ticket = new Ticket();

        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.TODO);
        ticket.setProject(project);
        ticket.setCreatedBy(creator);

        if (request.getAssignedToEmail() != null
                && !request.getAssignedToEmail().isBlank()) {

            User assignedUser = userRepository
                    .findByEmail(request.getAssignedToEmail())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));

            if (!hasProjectAccess(project, assignedUser.getEmail())) {
                throw new RuntimeException("Assigned user must be a project member");
            }

            ticket.setAssignedTo(assignedUser);
        }

        return ticketRepository.save(ticket);
    }

    // Get all tickets belonging to a project
    public List<Ticket> getTicketsByProject(Long projectId, String requesterEmail) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!hasProjectAccess(project, requesterEmail)) {
            throw new RuntimeException("You are not authorized to view these tickets");
        }

        return ticketRepository.findByProject(project);
    }

    // Update an existing ticket
    public Ticket updateTicket(
            Long ticketId,
            UpdateTicketRequest request,
            String requesterEmail) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Project project = ticket.getProject();

        if (!hasProjectAccess(project, requesterEmail)) {
            throw new RuntimeException("Only project members can update tickets");
        }

        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(request.getStatus());

        if (request.getAssignedToEmail() != null
                && !request.getAssignedToEmail().isBlank()) {

            User assignedUser = userRepository
                    .findByEmail(request.getAssignedToEmail())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));

            if (!hasProjectAccess(project, assignedUser.getEmail())) {
                throw new RuntimeException("Assigned user must be a project member");
            }

            ticket.setAssignedTo(assignedUser);

        } else {
            ticket.setAssignedTo(null);
        }

        return ticketRepository.save(ticket);
    }

    // Delete an existing ticket
    public void deleteTicket(Long ticketId, String requesterEmail) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!hasProjectAccess(ticket.getProject(), requesterEmail)) {
            throw new RuntimeException("Only project members can delete tickets");
        }

        ticketRepository.delete(ticket);
    }

    // Update ticket status for Kanban workflow
    public Ticket updateTicketStatus(
            Long ticketId,
            UpdateTicketStatusRequest request,
            String requesterEmail) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!hasProjectAccess(ticket.getProject(), requesterEmail)) {
            throw new RuntimeException("Only project members can update ticket status");
        }

        ticket.setStatus(request.getStatus());

        return ticketRepository.save(ticket);
    }

    // Filter project tickets by status
    public List<Ticket> getTicketsByProjectAndStatus(
            Long projectId,
            TicketStatus status,
            String requesterEmail) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!hasProjectAccess(project, requesterEmail)) {
            throw new RuntimeException("You are not authorized to view these tickets");
        }

        return ticketRepository.findByProjectAndStatus(project, status);
    }

    // Filter project tickets by priority
    public List<Ticket> getTicketsByProjectAndPriority(
            Long projectId,
            TicketPriority priority,
            String requesterEmail) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!hasProjectAccess(project, requesterEmail)) {
            throw new RuntimeException("You are not authorized to view these tickets");
        }

        return ticketRepository.findByProjectAndPriority(project, priority);
    }

    // Search project tickets by title
    public List<Ticket> searchTicketsByTitle(
            Long projectId,
            String title,
            String requesterEmail) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!hasProjectAccess(project, requesterEmail)) {
            throw new RuntimeException("You are not authorized to view these tickets");
        }

        return ticketRepository.findByProjectAndTitleContainingIgnoreCase(
                project, title);
    }
}
