package com.backend.hotel_v1.service;

import com.backend.hotel_v1.domain.dto.ServiceReqDto;
import com.backend.hotel_v1.domain.dto.ServiceResDto;
import com.backend.hotel_v1.domain.repositories.ServiceRepository;
import com.backend.hotel_v1.model.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Service
public class ServiceService {

    @Autowired
    private ServiceRepository serviceRepository;

    public Service createService(ServiceReqDto data) {
        Service service = new Service();
        service.setServiceName(data.serviceName());
        service.setPrice(data.price());
        serviceRepository.save(service);
        return service;
    }

    public Service findService(UUID idService) {
        return serviceRepository.findById(idService)
                .orElseThrow(() -> new IllegalArgumentException("Serviço não encontrado"));
    }

    public List<ServiceResDto> getFilteredServices(int pag, int tam, String serviceName) {
        serviceName = (serviceName != null) ? serviceName : "";
        Pageable pageable = PageRequest.of(pag, tam);
        Page<Service> services = serviceRepository.queryGetFilteredServices(serviceName, pageable);
        return services.map(s -> new ServiceResDto(s.getIdService(), s.getServiceName(), s.getPrice()))
                .stream().toList();
    }

    public Service updateService(UUID idService, ServiceReqDto data) {
        Service service = findService(idService);
        service.setServiceName(data.serviceName());
        service.setPrice(data.price());
        serviceRepository.save(service);
        return service;
    }

    public void deleteService(UUID idService) {
        try {
            serviceRepository.deleteById(idService);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar serviço: " + e);
        }
    }
}
