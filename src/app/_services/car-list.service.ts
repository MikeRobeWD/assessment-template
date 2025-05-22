import { Injectable } from '@angular/core';
import { collectionData, Firestore, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import type { VehicleWithId } from '../../types/vehicle';


@Injectable({ providedIn: 'root' })
export class CarListService {
  constructor(private firestore: Firestore) {}

  getCars(): Observable<VehicleWithId[]> {
    const carsRef = collection(this.firestore, 'vehicles');
    return collectionData(carsRef, { idField: 'id' }) as Observable<VehicleWithId[]>;
  }
}