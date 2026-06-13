package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.ServiceReqDto;
import com.backend.hotel_v1.domain.dto.ServiceResDto;
import com.backend.hotel_v1.model.Service;
import com.backend.hotel_v1.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/service")
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    @PostMapping
    public ResponseEntity<Service> create(@RequestBody ServiceReqDto req) {
        Service service = this.serviceService.createService(req);
        return ResponseEntity.ok(service);
    }

    @GetMapping
    public ResponseEntity<List<ServiceResDto>> listServices(@RequestParam(defaultValue = "0") int pag,
                                                             @RequestParam(defaultValue = "10") int tam,
                                                             @RequestParam(defaultValue = "") String serviceName) {
        List<ServiceResDto> services = this.serviceService.getFilteredServices(pag, tam, serviceName);
        return ResponseEntity.ok(services);
    }

    @PutMapping
    public ResponseEntity<Service> updateService(@RequestParam UUID idService,
                                                  @RequestBody ServiceReqDto req) {
        Service service = this.serviceService.updateService(idService, req);
        return ResponseEntity.status(201).body(service);
    }

    @DeleteMapping
    public ResponseEntity<String> deleteService(@RequestParam UUID idService) {
        this.serviceService.deleteService(idService);
        return ResponseEntity.ok("Serviço deletado com sucesso.");
    }
}
