package com.backend.hotel_v1.service;

import com.backend.hotel_v1.domain.dto.ReservationReqDto;
import com.backend.hotel_v1.domain.dto.ReservationResDto;
import com.backend.hotel_v1.domain.enums.ReservationStatus;
import com.backend.hotel_v1.domain.repositories.ReservationRepository;
import com.backend.hotel_v1.model.Guest;
import com.backend.hotel_v1.model.Reservation;
import com.backend.hotel_v1.model.Room;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private GuestService guestService;

    @Autowired
    private RoomService roomService;

    public Reservation createReservation(ReservationReqDto data) {
        Guest guest = guestService.findGuest(data.guestId());
        Room room = roomService.findRoom(data.roomId());

        Reservation reservation = new Reservation();
        reservation.setGuest(guest);
        reservation.setRoom(room);
        reservation.setReservationDate(new Date());
        reservation.setCheckInDate(data.checkInDate());
        reservation.setCheckOutDate(data.checkOutDate());
        reservation.setStatus(data.status() != null ? data.status() : ReservationStatus.PENDENTE);

        reservationRepository.save(reservation);
        return reservation;
    }

    public Reservation findReservation(UUID idReservation) {
        return reservationRepository.findById(idReservation)
                .orElseThrow(() -> new IllegalArgumentException("Reserva não encontrada"));
    }

    public List<ReservationResDto> getFilteredReservations(int pag, int tam, String status, UUID guestId, UUID roomId) {
        ReservationStatus reservationStatus = null;
        try { reservationStatus = (status != null && !status.isEmpty()) ? ReservationStatus.valueOf(status) : null; } catch (IllegalArgumentException ignored) {}

        Pageable pageable = PageRequest.of(pag, tam);
        Page<Reservation> reservations = reservationRepository.queryGetFilteredReservations(reservationStatus, guestId, roomId, pageable);
        return reservations.map(r -> new ReservationResDto(
                r.getIdReservation(),
                r.getGuest().getIdGuest(),
                r.getRoom().getIdRoom(),
                r.getReservationDate(),
                r.getCheckInDate(),
                r.getCheckOutDate(),
                r.getStatus()
        )).stream().toList();
    }

    public Reservation updateReservation(UUID idReservation, ReservationReqDto data) {
        Reservation reservation = findReservation(idReservation);
        Guest guest = guestService.findGuest(data.guestId());
        Room room = roomService.findRoom(data.roomId());

        reservation.setGuest(guest);
        reservation.setRoom(room);
        reservation.setCheckInDate(data.checkInDate());
        reservation.setCheckOutDate(data.checkOutDate());
        if (data.status() != null) reservation.setStatus(data.status());

        reservationRepository.save(reservation);
        return reservation;
    }

    public void deleteReservation(UUID idReservation) {
        try {
            reservationRepository.deleteById(idReservation);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar reserva: " + e);
        }
    }
}
