
package com.bugtracker.repository;

import com.bugtracker.entity.Ticket;
import com.bugtracker.entity.Project;
import com.bugtracker.entity.User;
import com.bugtracker.enums.TicketStatus;
import com.bugtracker.enums.TicketPriority;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Get all tickets belonging to a project
    List<Ticket> findByProject(Project project);

    // Get tickets created by a user
    List<Ticket> findByCreatedBy(User user);

    // Get tickets assigned to a user
    List<Ticket> findByAssignedTo(User user);

    // Get tickets by status
    List<Ticket> findByStatus(TicketStatus status);

    // Get tickets belonging to a project with a specific status
    List<Ticket> findByProjectAndStatus(Project project, TicketStatus status);

    // Get tickets belonging to a project with a specific priority
    List<Ticket> findByProjectAndPriority(Project project, TicketPriority priority);

    // Search tickets by title within a project
    List<Ticket> findByProjectAndTitleContainingIgnoreCase(Project project, String title);
}