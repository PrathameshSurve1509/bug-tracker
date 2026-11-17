
package com.bugtracker.controller;

import com.bugtracker.enums.TicketPriority;
import com.bugtracker.dto.TicketRequest;
import com.bugtracker.dto.TicketResponse;
import com.bugtracker.dto.UpdateTicketRequest;
import com.bugtracker.dto.UpdateTicketStatusRequest;
import com.bugtracker.entity.Ticket;
import com.bugtracker.enums.TicketStatus;
import com.bugtracker.service.TicketService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // Create a new ticket
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody TicketRequest request,
            Authentication authentication) {

        Ticket ticket = ticketService.createTicket(
                request,
                authentication.getName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(convertToResponse(ticket));
    }

    // Get all tickets belonging to a project
    @GetMapping("/project/{projectId}")
public ResponseEntity<List<TicketResponse>> getTicketsByProject(
        @PathVariable Long projectId,
        Authentication authentication) {

    System.out.println("CONTROLLER AUTH EMAIL: " + authentication.getName());

    List<TicketResponse> tickets = ticketService
            .getTicketsByProject(
                    projectId,
                    authentication.getName())
            .stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());

    return ResponseEntity.ok(tickets);
}

    // Update an existing ticket
    @PutMapping("/{ticketId}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody UpdateTicketRequest request,
            Authentication authentication) {

        Ticket ticket = ticketService.updateTicket(
                ticketId,
                request,
                authentication.getName());

        return ResponseEntity.ok(convertToResponse(ticket));
    }

    // Convert Ticket entity into TicketResponse
    private TicketResponse convertToResponse(Ticket ticket) {

        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getPriority(),
                ticket.getProject().getId(),
                ticket.getCreatedBy().getEmail(),
                ticket.getAssignedTo() != null
                        ? ticket.getAssignedTo().getEmail()
                        : null,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
    
    // Delete an existing ticket
    @DeleteMapping("/{ticketId}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long ticketId,
            Authentication authentication) {

        ticketService.deleteTicket(
                ticketId,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }

    // Update ticket status
    @PatchMapping("/{ticketId}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long ticketId,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            Authentication authentication) {

        Ticket ticket = ticketService.updateTicketStatus(
                ticketId,
                request,
                authentication.getName()
        );

        return ResponseEntity.ok(convertToResponse(ticket));
    }

    // Filter project tickets by status
    @GetMapping("/project/{projectId}/status/{status}")
    public ResponseEntity<List<TicketResponse>> getTicketsByProjectAndStatus(
            @PathVariable Long projectId,
            @PathVariable TicketStatus status,
            Authentication authentication) {

        List<TicketResponse> tickets = ticketService
                .getTicketsByProjectAndStatus(
                        projectId,
                        status,
                        authentication.getName())
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(tickets);
    }
// Filter project tickets by priority
@GetMapping("/project/{projectId}/priority/{priority}")
public ResponseEntity<List<TicketResponse>> getTicketsByProjectAndPriority(
        @PathVariable Long projectId,
        @PathVariable TicketPriority priority,
        Authentication authentication) {

    List<TicketResponse> tickets = ticketService
            .getTicketsByProjectAndPriority(
                    projectId,
                    priority,
                    authentication.getName())
            .stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());

    return ResponseEntity.ok(tickets);
}

// Search project tickets by title
@GetMapping("/project/{projectId}/search")
public ResponseEntity<List<TicketResponse>> searchTickets(
        @PathVariable Long projectId,
        @RequestParam String title,
        Authentication authentication) {

    List<TicketResponse> tickets = ticketService
            .searchTicketsByTitle(
                    projectId,
                    title,
                    authentication.getName())
            .stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());

    return ResponseEntity.ok(tickets);
}
}
