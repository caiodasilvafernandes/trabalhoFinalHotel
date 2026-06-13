package com.backend.hotel_v1.service;

import com.backend.hotel_v1.domain.dto.StayReqDto;
import com.backend.hotel_v1.domain.dto.StayResDto;
import com.backend.hotel_v1.domain.repositories.StayRepository;
import com.backend.hotel_v1.model.Reservation;
import com.backend.hotel_v1.model.Stay;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class StayService {

    @Autowired
    private StayRepository stayRepository;

    @Autowired
    private ReservationService reservationService;

    public Stay createStay(StayReqDto data) {
        Reservation reservation = reservationService.findReservation(data.reservationId());

        Stay stay = new Stay();
        stay.setReservation(reservation);
        stay.setActualCheckIn(data.actualCheckIn());
        stay.setActualCheckOut(data.actualCheckOut());

        stayRepository.save(stay);
        return stay;
    }

    public Stay findStay(UUID idStay) {
        return stayRepository.findById(idStay)
                .orElseThrow(() -> new IllegalArgumentException("Estadia não encontrada"));
    }

    public List<StayResDto> getFilteredStays(int pag, int tam, UUID reservationId) {
        Pageable pageable = PageRequest.of(pag, tam);
        Page<Stay> stays = stayRepository.queryGetFilteredStays(reservationId, pageable);
        return stays.map(s -> new StayResDto(
                s.getIdStay(),
                s.getReservation().getIdReservation(),
                s.getActualCheckIn(),
                s.getActualCheckOut()
        )).stream().toList();
    }

    public Stay updateStay(UUID idStay, StayReqDto data) {
        Stay stay = findStay(idStay);
        Reservation reservation = reservationService.findReservation(data.reservationId());

        stay.setReservation(reservation);
        stay.setActualCheckIn(data.actualCheckIn());
        stay.setActualCheckOut(data.actualCheckOut());

        stayRepository.save(stay);
        return stay;
    }

    public void deleteStay(UUID idStay) {
        try {
            stayRepository.deleteById(idStay);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar estadia: " + e);
        }
    }
}
