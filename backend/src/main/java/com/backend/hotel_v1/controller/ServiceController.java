package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.ServiceReqDto;
import com.backend.hotel_v1.domain.dto.ServiceResDto;
import com.backend.hotel_v1.model.Service;
import com.backend.hotel_v1.service.ServiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Serviços", description = "Rota para requisições de serviços do hotel")
@RestController
@RequestMapping("/service")
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    @Operation(summary = "Cria Serviço",
               description = "Contém operações de serialização, validação e criação de serviços",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Serviço Criado com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = Service.class))))
    @PostMapping
    public ResponseEntity<Service> create(@RequestBody ServiceReqDto req) {
        Service service = this.serviceService.createService(req);
        return ResponseEntity.ok(service);
    }

    @Operation(summary = "Lista Serviços com filtro",
               description = "Executa a operação de consulta com opção de filtro por nome do serviço",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Lista de Serviços:",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = ServiceResDto.class))))
    @GetMapping
    public ResponseEntity<List<ServiceResDto>> listServices(@RequestParam(defaultValue = "0") int pag,
                                                             @RequestParam(defaultValue = "10") int tam,
                                                             @RequestParam(defaultValue = "") String serviceName) {
        List<ServiceResDto> services = this.serviceService.getFilteredServices(pag, tam, serviceName);
        return ResponseEntity.ok(services);
    }

    @Operation(summary = "Atualiza Serviço",
               description = "Atualiza os dados de um serviço existente pelo seu identificador",
               responses = @ApiResponse(responseCode = "201",
                                        description = "Serviço Atualizado com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = Service.class))))
    @PutMapping
    public ResponseEntity<Service> updateService(@RequestParam UUID idService,
                                                  @RequestBody ServiceReqDto req) {
        Service service = this.serviceService.updateService(idService, req);
        return ResponseEntity.status(201).body(service);
    }

    @Operation(summary = "Deleta Serviço",
               description = "Remove um serviço do sistema pelo seu identificador",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Serviço Deletado com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = String.class))))
    @DeleteMapping
    public ResponseEntity<String> deleteService(@RequestParam UUID idService) {
        this.serviceService.deleteService(idService);
        return ResponseEntity.ok("Serviço deletado com sucesso.");
    }
}
