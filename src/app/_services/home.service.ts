import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collectionData,
  collection,
  updateDoc,
  arrayUnion,
  addDoc,
  serverTimestamp,
  doc,
  arrayRemove,
  docData,
} from '@angular/fire/firestore';
import { setCartId } from '../_store/cart/cart.actions';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { VehicleWithId } from '@types';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private firestore: Firestore = inject(Firestore);

  constructor(private store: Store) {}

  getVehicles() {
    const vehiclesCollection = collection(this.firestore, 'vehicles');
    return collectionData(vehiclesCollection, { idField: 'id' });
  }

  getVehiclesByIds(ids: string[]): Observable<VehicleWithId[]> {
    const vehicleObservables = ids.map((id) => {
      const vehicleRef = doc(this.firestore, 'vehicles', id);
      return docData(vehicleRef, { idField: 'id' });
    }) as Observable<VehicleWithId>[];

    return combineLatest(vehicleObservables);
  }

  getCart() {
    const cartId = sessionStorage.getItem('cartId');

    if (cartId) {
      this.store.dispatch(setCartId({ cartId: cartId }));

      const cartRef = doc(this.firestore, 'carts', cartId);
      return docData(cartRef, { idField: 'id' });
    }
  }

  async addToCart(vehicleId: string) {
    const cartId = sessionStorage.getItem('cartId');

    let cartRef;
    if (cartId) {
      cartRef = doc(this.firestore, 'carts', cartId);
      await updateDoc(cartRef, {
        items: arrayUnion(vehicleId),
      });
    } else {
      cartRef = await addDoc(collection(this.firestore, 'carts'), {
        items: arrayUnion(vehicleId),
        created: serverTimestamp(),
      });

      sessionStorage.setItem('cartId', cartRef.id);
    }

    this.store.dispatch(setCartId({ cartId: cartRef.id }));
  }

  async removeFromCart(vehicleId: string) {
    const cartId = sessionStorage.getItem('cartId');

    if (cartId) {
      const cartRef = doc(this.firestore, 'carts', cartId);
      await updateDoc(cartRef, {
        items: arrayRemove(vehicleId),
      });
    } else {
      console.error('No cart found in session.');
    }
  }
}
