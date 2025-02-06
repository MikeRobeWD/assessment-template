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
import { Cart } from '@types';

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

  getCart(): Observable<Cart | null> {
    const cartId = sessionStorage.getItem('cartId');
  
    if (!cartId) return new Observable<Cart | null>((observer) => observer.next(null));
    this.store.dispatch(setCartId({ cartId: cartId }));
  
    const cartRef = doc(this.firestore, 'carts', cartId);
    return docData(cartRef, { idField: 'id' }) as Observable<Cart>;
  }

  async addToCart(vehicleId: string): Promise<void> {
    let cartId = sessionStorage.getItem('cartId');
    let cartRef;

    if (cartId) {
      cartRef = doc(this.firestore, 'carts', cartId);
      await updateDoc(cartRef, {
        items: arrayUnion(vehicleId),
      });
    } else {
      cartRef = await addDoc(collection(this.firestore, 'carts'), {
        items: [vehicleId],
        created: serverTimestamp(),
      });

      cartId = cartRef.id;
      sessionStorage.setItem('cartId', cartId);
    }

    this.store.dispatch(setCartId({ cartId }));
    this.getCart().subscribe();
  }

  async removeFromCart(vehicleId: string): Promise<void> {
    const cartId = sessionStorage.getItem('cartId');
    if (!cartId) {
      console.error('No cart ID found in session storage.');
      return;
    }

    const cartRef = doc(this.firestore, 'carts', cartId);

    try {
      await updateDoc(cartRef, {
        items: arrayRemove(vehicleId),
      });
    } catch (error) {
      console.error('Error removing vehicle from cart:', error);
    }
  }

  async isVehicleInCart(vehicleId: string): Promise<boolean> {
    const cartId = sessionStorage.getItem('cartId');
    if (!cartId) return false;
    const cartRef = doc(this.firestore, 'carts', cartId);
    const cart = await docData(cartRef, { idField: 'id' }).toPromise();
    return cart?.items?.includes(vehicleId) ?? false;
  }
}
