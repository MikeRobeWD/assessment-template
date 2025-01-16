interface Vehicle {
  price: number;
  make: string;
  model: string;
  body: string;
  imageUrl: string;
}

interface VehicleWithId extends Vehicle {
  id: string;
}

export { Vehicle, VehicleWithId };
