package com.backend.hotel_v1.service;

import com.backend.hotel_v1.domain.dto.ServiceReqDto;
import com.backend.hotel_v1.domain.dto.ServiceResDto;
import com.backend.hotel_v1.domain.repositories.ServiceRepository;
import com.backend.hotel_v1.exception.ResourceNotFoundException;
import com.backend.hotel_v1.model.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

@org.springframework.stereotype.Service
public class ServiceService implements CrudService<ServiceResDto> {

    @Autowired
    private ServiceRepository serviceRepository;

    public ServiceResDto createService(ServiceReqDto data) {
        Service service = new Service();
        service.setServiceName(data.serviceName());
        service.setPrice(data.price());
        serviceRepository.save(service);
        return convertToResDto(service);
    }

    @Override
    public ServiceResDto findById(UUID id) {
        return findById(id, false);
    }

    // Sobrecarga de método
    public ServiceResDto findById(UUID id, boolean activeOnly) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));
        return convertToResDto(service);
    }

    public Service findServiceEntity(UUID id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));
    }

    public Page<ServiceResDto> getFilteredServices(String serviceName, Pageable pageable) {
        serviceName = (serviceName != null) ? serviceName : "";
        Page<Service> services = serviceRepository.queryGetFilteredServices(serviceName, pageable);
        return services.map(this::convertToResDto);
    }

    public ServiceResDto updateService(UUID id, ServiceReqDto data) {
        Service service = findServiceEntity(id);
        service.setServiceName(data.serviceName());
        service.setPrice(data.price());
        serviceRepository.save(service);
        return convertToResDto(service);
    }

    @Override
    public void delete(UUID id) {
        try {
            serviceRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar serviço: " + e.getMessage());
        }
    }

    private ServiceResDto convertToResDto(Service service) {
        return new ServiceResDto(service.getId(), service.getServiceName(), service.getPrice());
    }
}
