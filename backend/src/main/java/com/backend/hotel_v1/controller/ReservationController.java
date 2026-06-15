package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.ReservationReqDto;
import com.backend.hotel_v1.domain.dto.ReservationResDto;
import com.backend.hotel_v1.model.Reservation;
import com.backend.hotel_v1.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Reservas", description = "Rota para requisições de reservas")
@RestController
@RequestMapping("/reservation")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @Operation(summary = "Cria Reserva",
               description = "Contém operações de serialização, validação e criação de reservas",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Reserva Criada com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = Reservation.class))))
    @PostMapping
    public ResponseEntity<Reservation> create(@RequestBody ReservationReqDto req) {
        Reservation reservation = this.reservationService.createReservation(req);
        return ResponseEntity.ok(reservation);
    }

    @Operation(summary = "Lista Reservas com filtro",
               description = "Executa a operação de consulta com opção de filtros por status, hóspede e quarto",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Lista de Reservas:",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = ReservationResDto.class))))
    @GetMapping
    public ResponseEntity<List<ReservationResDto>> listReservations(@RequestParam(defaultValue = "0") int pag,
                                                                     @RequestParam(defaultValue = "10") int tam,
                                                                     @RequestParam(defaultValue = "") String status,
                                                                     @RequestParam(required = false) UUID guestId,
                                                                     @RequestParam(required = false) UUID roomId) {
        List<ReservationResDto> reservations = this.reservationService.getFilteredReservations(pag, tam, status, guestId, roomId);
        return ResponseEntity.ok(reservations);
    }

    @Operation(summary = "Atualiza Reserva",
               description = "Atualiza os dados de uma reserva existente pelo seu identificador",
               responses = @ApiResponse(responseCode = "201",
                                        description = "Reserva Atualizada com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = Reservation.class))))
    @PutMapping
    public ResponseEntity<Reservation> updateReservation(@RequestParam UUID idReservation,
                                                          @RequestBody ReservationReqDto req) {
        Reservation reservation = this.reservationService.updateReservation(idReservation, req);
        return ResponseEntity.status(201).body(reservation);
    }

    @Operation(summary = "Deleta Reserva",
               description = "Remove uma reserva do sistema pelo seu identificador",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Reserva Deletada com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = String.class))))
    @DeleteMapping
    public ResponseEntity<String> deleteReservation(@RequestParam UUID idReservation) {
        this.reservationService.deleteReservation(idReservation);
        return ResponseEntity.ok("Reserva deletada com sucesso.");
    }
}
