import { Component, Input, OnDestroy } from '@angular/core';
import { VehicleWithId } from '@types';
import { HomeService } from '../../../_services/home.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, switchMap, Observable, map, shareReplay } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../_store/app.state';
import { selectCartId } from '../../../_store/cart/cart.selectors';

interface Cart {
  items: string[];
}

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrl: './car-list.component.scss',
})
export class CarListComponent implements OnDestroy {
  @Input() vehicles: VehicleWithId[] = [];
  private destroy$ = new Subject<void>();
  readonly cartItems$: Observable<Cart>;

  constructor(
    private homeService: HomeService,
    private snackBar: MatSnackBar,
    private store: Store<AppState>
  ) {
    this.cartItems$ = this.store.pipe(
      select(selectCartId),
      switchMap((cartId) =>
        cartId
          ? this.homeService.getCart()
          : Promise.resolve({ items: [] } as Cart)
      ),
      map((cart) => ({ items: cart?.items || [] })),
      shareReplay(1)
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isInCart(vehicleId: string): Observable<boolean> {
    return this.cartItems$.pipe(map((cart) => cart.items.includes(vehicleId)));
  }

  async addToCart(vehicle: VehicleWithId) {
    try {
      await this.homeService.addToCart(vehicle.id);
      this.snackBar.open(
        `${vehicle.make} ${vehicle.model} added to cart!`,
        'Close',
        {
          duration: 3000,
        }
      );
    } catch (error) {
      console.error(error);
      this.snackBar.open(
        `Error adding ${vehicle.make} ${vehicle.model} to cart`,
        'Close',
        {
          duration: 3000,
        }
      );
    }
  }
}
