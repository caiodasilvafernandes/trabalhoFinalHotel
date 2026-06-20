const BASE = "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type RoomStatus = "livre" | "ocupado" | "reservado" | "limpando";
export type RoomType = "suite" | "individual";
export type ReservationStatus = "pendente" | "encerrado";

export interface Room {
  dailyRate: number;
  idRoom: string;
  roomNumber: string;
  roomStatus: RoomStatus;
  roomType: RoomType;
}

export interface Guest {
  cpf: string;
  email: string;
  idGuest: string;
  name: string;
  phone: string;
}

// Shape returned by GET /reservation (ReservationResDto — flat)
export interface Reservation {
  checkInDate: string;
  checkOutDate: string;
  guestId: string;
  idReservation: string;
  reservationDate: string;
  roomId: string;
  status: ReservationStatus;
}

// Shape returned by GET /stay (StayResDto — flat)
export interface Stay {
  actualCheckIn: string;
  actualCheckOut: string | null;
  idStay: string;
  reservationId: string;
}

export interface Service {
  idService: string;
  price: number;
  serviceName: string;
}

// Shape returned by GET /consumption (ServiceConsumptionResDto — flat)
export interface Consumption {
  consumptionId: string;
  quantity: number;
  serviceId: string;
  stayId: string;
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

function toRoomPayload(data: Omit<Room, "idRoom">) {
  return {
    ...data,
    roomType: data.roomType.toUpperCase(),
    roomStatus: data.roomStatus.toUpperCase(),
  };
}

export const roomsApi = {
  list: () => request<Room[]>("/room?tam=100"),
  create: (data: Omit<Room, "idRoom">) =>
    request<Room>("/room", {
      method: "POST",
      body: JSON.stringify(toRoomPayload(data)),
    }),
  update: (id: string, data: Omit<Room, "idRoom">) =>
    request<Room>(`/room?idRoom=${id}`, {
      method: "PUT",
      body: JSON.stringify(toRoomPayload(data)),
    }),
  delete: (id: string) =>
    request<void>(`/room?idRoom=${id}`, { method: "DELETE" }),
};

// ─── Guests ───────────────────────────────────────────────────────────────────

export const guestsApi = {
  list: () => request<Guest[]>("/guest?tam=100"),
  create: (data: Omit<Guest, "idGuest">) =>
    request<Guest>("/guest", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Omit<Guest, "idGuest">) =>
    request<Guest>(`/guest?idGuest=${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/guest?idGuest=${id}`, { method: "DELETE" }),
};

// ─── Reservations ─────────────────────────────────────────────────────────────

export const reservationsApi = {
  list: () => request<Reservation[]>("/reservation?tam=100"),
  create: (data: {
    guestId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
  }) =>
    request<Reservation>("/reservation", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: string,
    data: {
      guestId: string;
      roomId: string;
      checkInDate: string;
      checkOutDate: string;
      status: ReservationStatus;
    }
  ) =>
    request<Reservation>(`/reservation?idReservation=${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...data, status: data.status.toUpperCase() }),
    }),
  delete: (id: string) =>
    request<void>(`/reservation?idReservation=${id}`, { method: "DELETE" }),
};

// ─── Stays ────────────────────────────────────────────────────────────────────

export const staysApi = {
  list: () => request<Stay[]>("/stay?tam=100"),
  create: (data: { reservationId: string; actualCheckIn: string }) =>
    request<Stay>("/stay", { method: "POST", body: JSON.stringify(data) }),
  update: (
    id: string,
    data: {
      reservationId: string;
      actualCheckIn: string;
      actualCheckOut?: string;
    }
  ) =>
    request<Stay>(`/stay?idStay=${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/stay?idStay=${id}`, { method: "DELETE" }),
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const servicesApi = {
  list: () => request<Service[]>("/service?tam=100"),
  create: (data: Omit<Service, "idService">) =>
    request<Service>("/service", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Omit<Service, "idService">) =>
    request<Service>(`/service?idService=${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/service?idService=${id}`, { method: "DELETE" }),
};

// ─── Consumptions ─────────────────────────────────────────────────────────────

export const consumptionsApi = {
  list: () => request<Consumption[]>("/consumption?tam=100"),
  create: (data: { stayId: string; serviceId: string; quantity: number }) =>
    request<Consumption>("/consumption", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: string,
    data: { stayId: string; serviceId: string; quantity: number }
  ) =>
    request<Consumption>(`/consumption?consumptionId=${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/consumption?consumptionId=${id}`, { method: "DELETE" }),
};
