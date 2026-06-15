package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.GuestReqDto;
import com.backend.hotel_v1.domain.dto.GuestResDto;
import com.backend.hotel_v1.model.Guest;
import com.backend.hotel_v1.service.GuestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Visitantes", description = "Rota para requisições de visitantes")
@RestController
@RequestMapping("/guest")
public class GuestController {

    @Autowired
    private GuestService guestService;

    @Operation(summary = "Cria Visitantes",
               description = "Contem operações de serealização, validação e criação dos visitantes",
               responses = @ApiResponse(responseCode = "201",
                                        description = "Visitante Criado com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = Guest.class))))
    @PostMapping
    public ResponseEntity<Guest> create(@RequestBody GuestReqDto req){
        Guest guest = this.guestService.createGuest(req);

        return ResponseEntity.ok(guest);
    }

    @Operation(summary = "Lista Visitantes com filtro",
               description = "Executa a operação de consulta com opção de filtros",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Lista de Visitantes:",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = GuestResDto.class))))
    @GetMapping
    public ResponseEntity<List<GuestResDto>> listGuest(@RequestParam(defaultValue = "0") int pag,
                                                       @RequestParam(defaultValue = "0") int tam,
                                                       @RequestParam(defaultValue = "") String name,
                                                       @RequestParam(defaultValue = "") String cpf,
                                                       @RequestParam(defaultValue = "") String phone,
                                                       @RequestParam(defaultValue = "") String email){
        List<GuestResDto> guests = this.guestService.getFiltredGuests(pag, tam, name, cpf, phone, email);

        return ResponseEntity.ok(guests);
    }

    @Operation(summary = "Atualiza Visitante",
               description = "Atualiza os dados de um visitante existente pelo seu identificador",
               responses = @ApiResponse(responseCode = "201",
                                        description = "Visitante Atualizado com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = Guest.class))))
    @PutMapping
    public ResponseEntity<Guest> updateGuest(@RequestParam(defaultValue = "") UUID idGuest,
                                             @RequestBody GuestReqDto req){
        if (idGuest == null){
            ResponseEntity.status(400).body("identificador do visitante não deve ser vazio");
        }

        Guest guest = this.guestService.updateGuest(idGuest, req);

        return ResponseEntity.status(201).body(guest);
    }

    @Operation(summary = "Deleta Visitante",
               description = "Remove um visitante do sistema pelo seu identificador",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Visitante Deletado com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = String.class))))
    @DeleteMapping
    public ResponseEntity<String> deleteGuest(@RequestParam(defaultValue = "") UUID idGuest){
        if (idGuest == null){
            ResponseEntity.status(400).body("identificador do visitante não deve ser vazio");
        }

        this.guestService.deleteGuest(idGuest);

        return ResponseEntity.status(200).body("Visitante deletado com sucesso.");
    }
}
