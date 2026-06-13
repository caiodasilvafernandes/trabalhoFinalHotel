package com.backend.hotel_v1.service;

import com.backend.hotel_v1.domain.dto.ServiceConsumptionReqDto;
import com.backend.hotel_v1.domain.dto.ServiceConsumptionResDto;
import com.backend.hotel_v1.domain.repositories.ServiceConsumptionRepository;
import com.backend.hotel_v1.model.Service;
import com.backend.hotel_v1.model.ServiceConsumption;
import com.backend.hotel_v1.model.Stay;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Service
public class ServiceConsumptionService {

    @Autowired
    private ServiceConsumptionRepository serviceConsumptionRepository;

    @Autowired
    private StayService stayService;

    @Autowired
    private ServiceService serviceService;

    public ServiceConsumption createConsumption(ServiceConsumptionReqDto data) {
        Stay stay = stayService.findStay(data.stayId());
        Service service = serviceService.findService(data.serviceId());

        ServiceConsumption consumption = new ServiceConsumption();
        consumption.setStay(stay);
        consumption.setService(service);
        consumption.setQuantity(data.quantity() != null ? data.quantity() : 1);

        serviceConsumptionRepository.save(consumption);
        return consumption;
    }

    public ServiceConsumption findConsumption(UUID consumptionId) {
        return serviceConsumptionRepository.findById(consumptionId)
                .orElseThrow(() -> new IllegalArgumentException("Consumo não encontrado"));
    }

    public List<ServiceConsumptionResDto> getFilteredConsumptions(int pag, int tam, UUID stayId, UUID serviceId) {
        Pageable pageable = PageRequest.of(pag, tam);
        Page<ServiceConsumption> consumptions = serviceConsumptionRepository.queryGetFilteredConsumptions(stayId, serviceId, pageable);
        return consumptions.map(c -> new ServiceConsumptionResDto(
                c.getConsumptionId(),
                c.getStay().getIdStay(),
                c.getService().getIdService(),
                c.getQuantity()
        )).stream().toList();
    }

    public ServiceConsumption updateConsumption(UUID consumptionId, ServiceConsumptionReqDto data) {
        ServiceConsumption consumption = findConsumption(consumptionId);
        Stay stay = stayService.findStay(data.stayId());
        Service service = serviceService.findService(data.serviceId());

        consumption.setStay(stay);
        consumption.setService(service);
        consumption.setQuantity(data.quantity());

        serviceConsumptionRepository.save(consumption);
        return consumption;
    }

    public void deleteConsumption(UUID consumptionId) {
        try {
            serviceConsumptionRepository.deleteById(consumptionId);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar consumo: " + e);
        }
    }
}
