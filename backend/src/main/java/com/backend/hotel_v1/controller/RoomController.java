package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.RoomReqDto;
import com.backend.hotel_v1.domain.dto.RoomResDto;
import com.backend.hotel_v1.model.Room;
import com.backend.hotel_v1.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/room")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @PostMapping
    public ResponseEntity<Room> create(@RequestBody RoomReqDto req) {
        Room room = this.roomService.createRoom(req);
        return ResponseEntity.ok(room);
    }

    @GetMapping
    public ResponseEntity<List<RoomResDto>> listRooms(@RequestParam(defaultValue = "0") int pag,
                                                       @RequestParam(defaultValue = "10") int tam,
                                                       @RequestParam(defaultValue = "") String roomNumber,
                                                       @RequestParam(defaultValue = "") String roomStatus,
                                                       @RequestParam(defaultValue = "") String roomType) {
        List<RoomResDto> rooms = this.roomService.getFilteredRooms(pag, tam, roomNumber, roomStatus, roomType);
        return ResponseEntity.ok(rooms);
    }

    @PutMapping
    public ResponseEntity<Room> updateRoom(@RequestParam UUID idRoom,
                                           @RequestBody RoomReqDto req) {
        Room room = this.roomService.updateRoom(idRoom, req);
        return ResponseEntity.status(201).body(room);
    }

    @DeleteMapping
    public ResponseEntity<String> deleteRoom(@RequestParam UUID idRoom) {
        this.roomService.deleteRoom(idRoom);
        return ResponseEntity.ok("Quarto deletado com sucesso.");
    }
}
