package com.backend.hotel_v1.service;

import com.backend.hotel_v1.domain.dto.ServiceConsumptionReqDto;
import com.backend.hotel_v1.domain.dto.ServiceConsumptionResDto;
import com.backend.hotel_v1.domain.repositories.ServiceConsumptionRepository;
import com.backend.hotel_v1.exception.ResourceNotFoundException;
import com.backend.hotel_v1.model.Service;
import com.backend.hotel_v1.model.ServiceConsumption;
import com.backend.hotel_v1.model.Stay;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

@org.springframework.stereotype.Service
public class ServiceConsumptionService implements CrudService<ServiceConsumptionResDto> {

    @Autowired
    private ServiceConsumptionRepository serviceConsumptionRepository;

    @Autowired
    private StayService stayService;

    @Autowired
    private ServiceService serviceService;

    public ServiceConsumptionResDto createConsumption(ServiceConsumptionReqDto data) {
        Stay stay = stayService.findStayEntity(data.stayId());
        Service service = serviceService.findServiceEntity(data.serviceId());

        ServiceConsumption consumption = new ServiceConsumption();
        consumption.setStay(stay);
        consumption.setService(service);
        consumption.setQuantity(data.quantity() != null ? data.quantity() : 1);

        serviceConsumptionRepository.save(consumption);
        return convertToResDto(consumption);
    }

    @Override
    public ServiceConsumptionResDto findById(UUID id) {
        return findById(id, false);
    }

    // Sobrecarga de método
    public ServiceConsumptionResDto findById(UUID id, boolean activeOnly) {
        ServiceConsumption consumption = serviceConsumptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consumo não encontrado"));
        return convertToResDto(consumption);
    }

    public ServiceConsumption findConsumptionEntity(UUID id) {
        return serviceConsumptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consumo não encontrado"));
    }

    public Page<ServiceConsumptionResDto> getFilteredConsumptions(UUID stayId, UUID serviceId, Pageable pageable) {
        Page<ServiceConsumption> consumptions = serviceConsumptionRepository.queryGetFilteredConsumptions(stayId, serviceId, pageable);
        return consumptions.map(this::convertToResDto);
    }

    public ServiceConsumptionResDto updateConsumption(UUID id, ServiceConsumptionReqDto data) {
        ServiceConsumption consumption = findConsumptionEntity(id);
        Stay stay = stayService.findStayEntity(data.stayId());
        Service service = serviceService.findServiceEntity(data.serviceId());

        consumption.setStay(stay);
        consumption.setService(service);
        consumption.setQuantity(data.quantity());

        serviceConsumptionRepository.save(consumption);
        return convertToResDto(consumption);
    }

    @Override
    public void delete(UUID id) {
        try {
            serviceConsumptionRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar consumo: " + e.getMessage());
        }
    }

    private ServiceConsumptionResDto convertToResDto(ServiceConsumption consumption) {
        return new ServiceConsumptionResDto(
                consumption.getId(),
                consumption.getStay().getId(),
                consumption.getService().getId(),
                consumption.getQuantity()
        );
    }
}
