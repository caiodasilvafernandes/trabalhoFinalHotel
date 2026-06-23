package com.backend.hotel_v1.domain.repositories;

import com.backend.hotel_v1.domain.enums.ReservationStatus;
import com.backend.hotel_v1.model.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    @Query("SELECT r FROM Reservation r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:guestId IS NULL OR r.guest.id = :guestId) AND " +
           "(:roomId IS NULL OR r.room.id = :roomId)")
    Page<Reservation> queryGetFilteredReservations(@Param("status") ReservationStatus status,
                                                   @Param("guestId") UUID guestId,
                                                   @Param("roomId") UUID roomId,
                                                   Pageable pageable);

    // Métodos derivados para filtros
    Page<Reservation> findByStatus(ReservationStatus status, Pageable pageable);
    Page<Reservation> findByGuestId(UUID guestId, Pageable pageable);
    Page<Reservation> findByRoomId(UUID roomId, Pageable pageable);
}
