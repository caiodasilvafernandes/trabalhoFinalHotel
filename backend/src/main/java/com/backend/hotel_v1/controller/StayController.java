package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.StayReqDto;
import com.backend.hotel_v1.domain.dto.StayResDto;
import com.backend.hotel_v1.model.Stay;
import com.backend.hotel_v1.service.StayService;
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

@Tag(name = "Estadias", description = "Rota para requisições de estadias")
@RestController
@RequestMapping("/stay")
public class StayController {

    @Autowired
    private StayService stayService;

    @Operation(summary = "Cria Estadia",
               description = "Contém operações de serialização, validação e criação de estadias vinculadas a reservas",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Estadia Criada com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = Stay.class))))
    @PostMapping
    public ResponseEntity<Stay> create(@RequestBody StayReqDto req) {
        Stay stay = this.stayService.createStay(req);
        return ResponseEntity.ok(stay);
    }

    @Operation(summary = "Lista Estadias com filtro",
               description = "Executa a operação de consulta com opção de filtro por reserva",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Lista de Estadias:",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = StayResDto.class))))
    @GetMapping
    public ResponseEntity<List<StayResDto>> listStays(@RequestParam(defaultValue = "0") int pag,
                                                       @RequestParam(defaultValue = "10") int tam,
                                                       @RequestParam(required = false) UUID reservationId) {
        List<StayResDto> stays = this.stayService.getFilteredStays(pag, tam, reservationId);
        return ResponseEntity.ok(stays);
    }

    @Operation(summary = "Atualiza Estadia",
               description = "Atualiza os dados de uma estadia existente pelo seu identificador",
               responses = @ApiResponse(responseCode = "201",
                                        description = "Estadia Atualizada com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = Stay.class))))
    @PutMapping
    public ResponseEntity<Stay> updateStay(@RequestParam UUID idStay,
                                            @RequestBody StayReqDto req) {
        Stay stay = this.stayService.updateStay(idStay, req);
        return ResponseEntity.status(201).body(stay);
    }

    @Operation(summary = "Deleta Estadia",
               description = "Remove uma estadia do sistema pelo seu identificador",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Estadia Deletada com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = String.class))))
    @DeleteMapping
    public ResponseEntity<String> deleteStay(@RequestParam UUID idStay) {
        this.stayService.deleteStay(idStay);
        return ResponseEntity.ok("Estadia deletada com sucesso.");
    }
}
