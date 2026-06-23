package com.backend.hotel_v1.domain.repositories;

import com.backend.hotel_v1.model.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ServiceRepository extends JpaRepository<Service, UUID> {

    @Query("SELECT s FROM Service s WHERE " +
           "(:serviceName = '' OR s.serviceName LIKE %:serviceName%)")
    Page<Service> queryGetFilteredServices(@Param("serviceName") String serviceName, Pageable pageable);

    // Método derivado para filtro por nome
    Page<Service> findByServiceNameContainingIgnoreCase(String serviceName, Pageable pageable);
}
