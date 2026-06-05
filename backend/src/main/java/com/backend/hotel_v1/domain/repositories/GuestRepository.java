package com.backend.hotel_v1.domain.repositories;

import com.backend.hotel_v1.model.Guest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GuestRepository extends JpaRepository<Guest, UUID> {
}
