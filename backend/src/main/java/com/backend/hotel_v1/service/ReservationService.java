package com.backend.hotel_v1.service;

import com.backend.hotel_v1.domain.dto.ReservationReqDto;
import com.backend.hotel_v1.domain.dto.ReservationResDto;
import com.backend.hotel_v1.domain.enums.ReservationStatus;
import com.backend.hotel_v1.domain.repositories.ReservationRepository;
import com.backend.hotel_v1.exception.ResourceNotFoundException;
import com.backend.hotel_v1.model.Guest;
import com.backend.hotel_v1.model.Reservation;
import com.backend.hotel_v1.model.Room;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;

@Service
public class ReservationService implements CrudService<ReservationResDto> {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private GuestService guestService;

    @Autowired
    private RoomService roomService;

    public ReservationResDto createReservation(ReservationReqDto data) {
        Guest guest = guestService.findGuestEntity(data.guestId());
        Room room = roomService.findRoomEntity(data.roomId());

        Reservation reservation = new Reservation();
        reservation.setGuest(guest);
        reservation.setRoom(room);
        reservation.setReservationDate(new Date());
        reservation.setCheckInDate(data.checkInDate());
        reservation.setCheckOutDate(data.checkOutDate());
        reservation.setStatus(data.status() != null ? data.status() : ReservationStatus.PENDENTE);

        reservationRepository.save(reservation);
        return convertToResDto(reservation);
    }

    @Override
    public ReservationResDto findById(UUID id) {
        return findById(id, false);
    }

    // Sobrecarga de método
    public ReservationResDto findById(UUID id, boolean activeOnly) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada"));
        if (activeOnly && reservation.getStatus() == ReservationStatus.ENCERRADO) {
            throw new ResourceNotFoundException("Reserva já encerrada");
        }
        return convertToResDto(reservation);
    }

    public Reservation findReservationEntity(UUID id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada"));
    }

    public Page<ReservationResDto> getFilteredReservations(String status, UUID guestId, UUID roomId, Pageable pageable) {
        ReservationStatus reservationStatus = null;
        try { reservationStatus = (status != null && !status.isEmpty()) ? ReservationStatus.valueOf(status.toUpperCase()) : null; } catch (Exception ignored) {}

        Page<Reservation> reservations = reservationRepository.queryGetFilteredReservations(reservationStatus, guestId, roomId, pageable);
        return reservations.map(this::convertToResDto);
    }

    public ReservationResDto updateReservation(UUID id, ReservationReqDto data) {
        Reservation reservation = findReservationEntity(id);
        Guest guest = guestService.findGuestEntity(data.guestId());
        Room room = roomService.findRoomEntity(data.roomId());

        reservation.setGuest(guest);
        reservation.setRoom(room);
        reservation.setCheckInDate(data.checkInDate());
        reservation.setCheckOutDate(data.checkOutDate());
        if (data.status() != null) reservation.setStatus(data.status());

        reservationRepository.save(reservation);
        return convertToResDto(reservation);
    }

    @Override
    public void delete(UUID id) {
        try {
            reservationRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar reserva: " + e.getMessage());
        }
    }

    private ReservationResDto convertToResDto(Reservation reservation) {
        return new ReservationResDto(
                reservation.getId(),
                reservation.getGuest().getId(),
                reservation.getRoom().getId(),
                reservation.getReservationDate(),
                reservation.getCheckInDate(),
                reservation.getCheckOutDate(),
                reservation.getStatus()
        );
    }
}
