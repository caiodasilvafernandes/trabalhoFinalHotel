package com.backend.hotel_v1.service;

import com.backend.hotel_v1.domain.dto.GuestReqDto;
import com.backend.hotel_v1.domain.dto.GuestResDto;
import com.backend.hotel_v1.domain.repositories.GuestRepository;
import com.backend.hotel_v1.model.Guest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class GuestService {

    @Autowired
    private GuestRepository guestRepository;

    public Guest createGuest(GuestReqDto data){
        Guest newGuest = new Guest();

        newGuest.setName(data.name());
        newGuest.setCpf(data.cpf());
        newGuest.setPhone(data.phone());
        newGuest.setEmail(data.email());

        guestRepository.save(newGuest);

        return newGuest;
    }

    public Guest findGuest(UUID idGuest){
        return guestRepository
                .findById(idGuest)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));
    }

    public List<GuestResDto> getFiltredGuests(int pag,
                                               int tam,
                                               String name,
                                               String cpf,
                                               String phone,
                                               String email){

        name = (name != null) ? name : "";
        cpf = (cpf != null) ? cpf : "";
        phone = (phone != null) ? phone : "";
        email = (email != null) ? email : "";

        Pageable pageable = PageRequest.of(pag, tam);

        Page<Guest> listGuest = this.guestRepository.querygGetFiltredGuest(name,cpf,phone,email,pageable);

        return listGuest.map(guest -> new GuestResDto(guest.getIdGuest(),
                                                            guest.getName(),
                                                            guest.getCpf(),
                                                            guest.getPhone(),
                                                            guest.getEmail())).stream().toList();
    }

    public Guest updateGuest(UUID idGuest, GuestReqDto data){
        Guest guest = this.findGuest(idGuest);

        guest.setName(data.name());
        guest.setCpf(data.cpf());
        guest.setPhone(data.phone());
        guest.setEmail(data.email());

        guestRepository.save(guest);

        return guest;
    }

    public void deleteGuest(UUID idGuest){
        try{
            guestRepository.deleteById(idGuest);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar visitante: " + e);
        }
    }
}
