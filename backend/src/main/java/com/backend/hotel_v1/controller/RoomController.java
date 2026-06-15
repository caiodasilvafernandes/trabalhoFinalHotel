package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.RoomReqDto;
import com.backend.hotel_v1.domain.dto.RoomResDto;
import com.backend.hotel_v1.model.Room;
import com.backend.hotel_v1.service.RoomService;
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

@Tag(name = "Quartos", description = "Rota para requisições de quartos")
@RestController
@RequestMapping("/room")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @Operation(summary = "Cria Quarto",
               description = "Contém operações de serialização, validação e criação de quartos",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Quarto Criado com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = Room.class))))
    @PostMapping
    public ResponseEntity<Room> create(@RequestBody RoomReqDto req) {
        Room room = this.roomService.createRoom(req);
        return ResponseEntity.ok(room);
    }

    @Operation(summary = "Lista Quartos com filtro",
               description = "Executa a operação de consulta com opção de filtros por número, status e tipo do quarto",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Lista de Quartos:",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = RoomResDto.class))))
    @GetMapping
    public ResponseEntity<List<RoomResDto>> listRooms(@RequestParam(defaultValue = "0") int pag,
                                                       @RequestParam(defaultValue = "10") int tam,
                                                       @RequestParam(defaultValue = "") String roomNumber,
                                                       @RequestParam(defaultValue = "") String roomStatus,
                                                       @RequestParam(defaultValue = "") String roomType) {
        List<RoomResDto> rooms = this.roomService.getFilteredRooms(pag, tam, roomNumber, roomStatus, roomType);
        return ResponseEntity.ok(rooms);
    }

    @Operation(summary = "Atualiza Quarto",
               description = "Atualiza os dados de um quarto existente pelo seu identificador",
               responses = @ApiResponse(responseCode = "201",
                                        description = "Quarto Atualizado com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = Room.class))))
    @PutMapping
    public ResponseEntity<Room> updateRoom(@RequestParam UUID idRoom,
                                           @RequestBody RoomReqDto req) {
        Room room = this.roomService.updateRoom(idRoom, req);
        return ResponseEntity.status(201).body(room);
    }

    @Operation(summary = "Deleta Quarto",
               description = "Remove um quarto do sistema pelo seu identificador",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Quarto Deletado com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = String.class))))
    @DeleteMapping
    public ResponseEntity<String> deleteRoom(@RequestParam UUID idRoom) {
        this.roomService.deleteRoom(idRoom);
        return ResponseEntity.ok("Quarto deletado com sucesso.");
    }
}
