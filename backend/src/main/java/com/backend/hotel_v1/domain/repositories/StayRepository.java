package com.backend.hotel_v1.domain.repositories;

import com.backend.hotel_v1.model.Stay;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

public interface StayRepository extends JpaRepository<Stay, UUID> {

    @Modifying
    @Transactional
    @Query("DELETE FROM Stay s WHERE s.id = :id")
    void deleteStayById(@Param("id") UUID id);

    @Query("SELECT s FROM Stay s WHERE " +
           "(:reservationId IS NULL OR s.reservation.id = :reservationId)")
    Page<Stay> queryGetFilteredStays(@Param("reservationId") UUID reservationId, Pageable pageable);

    // Método derivado para filtro por reserva
    Page<Stay> findByReservationId(UUID reservationId, Pageable pageable);
}
