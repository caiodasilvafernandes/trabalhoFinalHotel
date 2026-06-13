package com.backend.hotel_v1.domain.repositories;

import com.backend.hotel_v1.model.Stay;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface StayRepository extends JpaRepository<Stay, UUID> {

    @Query("SELECT s FROM Stay s WHERE " +
           "(:reservationId IS NULL OR s.reservation.idReservation = :reservationId)")
    Page<Stay> queryGetFilteredStays(@Param("reservationId") UUID reservationId, Pageable pageable);
}
