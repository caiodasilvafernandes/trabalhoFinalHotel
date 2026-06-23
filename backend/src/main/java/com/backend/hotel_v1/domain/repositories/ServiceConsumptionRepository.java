package com.backend.hotel_v1.domain.repositories;

import com.backend.hotel_v1.model.ServiceConsumption;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ServiceConsumptionRepository extends JpaRepository<ServiceConsumption, UUID> {

    @Query("SELECT sc FROM ServiceConsumption sc WHERE " +
           "(:stayId IS NULL OR sc.stay.id = :stayId) AND " +
           "(:serviceId IS NULL OR sc.service.id = :serviceId)")
    Page<ServiceConsumption> queryGetFilteredConsumptions(@Param("stayId") UUID stayId,
                                                          @Param("serviceId") UUID serviceId,
                                                          Pageable pageable);

    // Métodos derivados para filtros
    Page<ServiceConsumption> findByStayId(UUID stayId, Pageable pageable);
    Page<ServiceConsumption> findByServiceId(UUID serviceId, Pageable pageable);
}
