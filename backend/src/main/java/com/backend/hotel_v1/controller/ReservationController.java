package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.ReservationReqDto;
import com.backend.hotel_v1.domain.dto.ReservationResDto;
import com.backend.hotel_v1.model.Reservation;
import com.backend.hotel_v1.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reservation")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @PostMapping
    public ResponseEntity<Reservation> create(@RequestBody ReservationReqDto req) {
        Reservation reservation = this.reservationService.createReservation(req);
        return ResponseEntity.ok(reservation);
    }

    @GetMapping
    public ResponseEntity<List<ReservationResDto>> listReservations(@RequestParam(defaultValue = "0") int pag,
                                                                     @RequestParam(defaultValue = "10") int tam,
                                                                     @RequestParam(defaultValue = "") String status,
                                                                     @RequestParam(required = false) UUID guestId,
                                                                     @RequestParam(required = false) UUID roomId) {
        List<ReservationResDto> reservations = this.reservationService.getFilteredReservations(pag, tam, status, guestId, roomId);
        return ResponseEntity.ok(reservations);
    }

    @PutMapping
    public ResponseEntity<Reservation> updateReservation(@RequestParam UUID idReservation,
                                                          @RequestBody ReservationReqDto req) {
        Reservation reservation = this.reservationService.updateReservation(idReservation, req);
        return ResponseEntity.status(201).body(reservation);
    }

    @DeleteMapping
    public ResponseEntity<String> deleteReservation(@RequestParam UUID idReservation) {
        this.reservationService.deleteReservation(idReservation);
        return ResponseEntity.ok("Reserva deletada com sucesso.");
    }
}
