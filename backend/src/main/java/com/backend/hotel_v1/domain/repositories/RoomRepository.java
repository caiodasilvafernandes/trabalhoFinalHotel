package com.backend.hotel_v1.domain.repositories;

import com.backend.hotel_v1.domain.enums.RoomStatus;
import com.backend.hotel_v1.domain.enums.RoomTypes;
import com.backend.hotel_v1.model.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {

    @Query("SELECT r FROM Room r WHERE " +
           "(:roomNumber = '' OR r.roomNumber LIKE %:roomNumber%) AND " +
           "(:roomStatus IS NULL OR r.roomStatus = :roomStatus) AND " +
           "(:roomType IS NULL OR r.roomType = :roomType)")
    Page<Room> queryGetFilteredRooms(@Param("roomNumber") String roomNumber,
                                     @Param("roomStatus") RoomStatus roomStatus,
                                     @Param("roomType") RoomTypes roomType,
                                     Pageable pageable);

    // Métodos derivados para filtros
    Page<Room> findByRoomType(RoomTypes roomType, Pageable pageable);
    Page<Room> findByRoomStatus(RoomStatus roomStatus, Pageable pageable);
}
