package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.ReservationReqDto;
import com.backend.hotel_v1.domain.dto.ReservationResDto;
import com.backend.hotel_v1.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Tag(name = "Reservas", description = "Rota para requisições de reservas")
@RestController
@RequestMapping("/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @Operation(summary = "Cria Reserva")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Reserva criada com sucesso!",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ReservationResDto.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    @PostMapping
    public ResponseEntity<ReservationResDto> create(@RequestBody ReservationReqDto req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.createReservation(req));
    }

    @Operation(summary = "Busca Reserva por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Reserva encontrada",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ReservationResDto.class))),
            @ApiResponse(responseCode = "404", description = "Reserva não encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ReservationResDto> findById(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "false") boolean activeOnly) {

        return ResponseEntity.ok(reservationService.findById(id, activeOnly));
    }

    @Operation(summary = "Lista Reservas")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso!",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(
                                    schema = @Schema(implementation = ReservationResDto.class)
                            )
                    ))
    })
    @GetMapping
    public ResponseEntity<List<ReservationResDto>> listReservations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "reservationDate,asc") String sort,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(required = false) UUID guestId,
            @RequestParam(required = false) UUID roomId) {

        String finalStatus = status;

        if (status.equalsIgnoreCase("CONFIRMED")) {
            finalStatus = "CONFIRMADA";
        } else if (status.equalsIgnoreCase("CANCELLED")) {
            finalStatus = "CANCELADA";
        }

        String[] sortParams = sort.split(",");

        Sort sortOrder = Sort.by(
                sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC,
                sortParams[0]
        );

        Pageable pageable = PageRequest.of(page, size, sortOrder);

        Page<ReservationResDto> reservations =
                reservationService.getFilteredReservations(finalStatus, guestId, roomId, pageable);

        return ResponseEntity.ok(reservations.getContent());
    }

    @Operation(summary = "Atualiza Reserva")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Atualizada com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ReservationResDto.class)))
    })
    @PutMapping("/{id}")
    public ResponseEntity<ReservationResDto> updateReservation(
            @PathVariable UUID id,
            @RequestBody ReservationReqDto req) {

        return ResponseEntity.ok(reservationService.updateReservation(id, req));
    }

    @Operation(summary = "Deleta Reserva")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Deletada com sucesso")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable UUID id) {
        reservationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}