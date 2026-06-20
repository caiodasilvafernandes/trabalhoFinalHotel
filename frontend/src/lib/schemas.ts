import { z } from "zod";

export const roomSchema = z.object({
  roomNumber: z.string().min(1, "Número obrigatório"),
  roomType: z.enum(["individual", "suite"]),
  dailyRate: z.coerce.number().positive("Deve ser maior que zero"),
  roomStatus: z.enum(["livre", "ocupado", "reservado", "limpando"]),
});

export const guestSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos"),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Email inválido"),
});

export const reservationSchema = z
  .object({
    guestId: z.string().min(1, "Selecione um hóspede"),
    roomId: z.string().min(1, "Selecione um quarto"),
    checkInDate: z.string().min(1, "Data obrigatória"),
    checkOutDate: z.string().min(1, "Data obrigatória"),
    status: z.enum(["pendente", "encerrado"]).optional(),
  })
  .refine((d) => !d.checkOutDate || d.checkOutDate > d.checkInDate, {
    message: "Check-out deve ser após check-in",
    path: ["checkOutDate"],
  });

export const staySchema = z.object({
  reservationId: z.string().min(1, "Selecione uma reserva"),
  actualCheckIn: z.string().min(1, "Data obrigatória"),
  actualCheckOut: z.string().optional(),
});

export const serviceSchema = z.object({
  serviceName: z.string().min(2, "Nome obrigatório"),
  price: z.coerce.number().positive("Deve ser maior que zero"),
});

export const consumptionSchema = z.object({
  stayId: z.string().min(1, "Selecione uma estadia"),
  serviceId: z.string().min(1, "Selecione um serviço"),
  quantity: z.coerce.number().int().positive("Quantidade mínima: 1"),
});

export type RoomForm = z.infer<typeof roomSchema>;
export type GuestForm = z.infer<typeof guestSchema>;
export type ReservationForm = z.infer<typeof reservationSchema>;
export type StayForm = z.infer<typeof staySchema>;
export type ServiceForm = z.infer<typeof serviceSchema>;
export type ConsumptionForm = z.infer<typeof consumptionSchema>;
