import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import {
  filter,
  map,
  Observable,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { select, Store } from '@ngrx/store';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';

import { HomeService } from '../../_services/home.service';
import { Cart, VehicleWithId } from '@types';
import { selectCartId } from '../../_store/cart/cart.selectors';
import { AppState } from '../../_store/app.state';
import { formatToCurrency } from '@utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { setCartId } from '../../_store/cart/cart.actions';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatListModule,
    CommonModule,
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
  providers: [HomeService],
})
export class NavBarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public cartId$: Observable<string | null>;
  public cart: string[] = [];
  public cartVehicles: VehicleWithId[] = [];
  public formatToCurrency = formatToCurrency;
  private currentCartId: string | null = null;

  constructor(
    private homeService: HomeService,
    private store: Store<AppState>,
    private snackBar: MatSnackBar
  ) {
    this.cartId$ = this.store.pipe(select(selectCartId));
  }

  ngOnInit() {
    // Check for existing cart in session storage
    const existingCartId = sessionStorage.getItem('cartId');
    if (existingCartId) {
      this.store.dispatch(setCartId({ cartId: existingCartId }));
    }

    // Subscribe to cart changes
    this.cartId$
      .pipe(
        filter((cartId): cartId is string => cartId !== null),
        tap((cartId) => (this.currentCartId = cartId)),
        switchMap(() =>
          this.homeService.getCart().pipe(
            filter((cart): cart is Cart & { id: string } => cart !== undefined),
            tap((cart) => {
              // Update session storage if cart ID has changed
              if (cart.id !== this.currentCartId) {
                sessionStorage.setItem('cartId', cart.id);
                this.store.dispatch(setCartId({ cartId: cart.id }));
              }
              this.cart = cart.items;
              if (cart.items.length === 0) {
                this.cartVehicles = [];
              }
            }),
            switchMap((cart) =>
              cart.items.length > 0
                ? this.homeService.getVehiclesByIds(cart.items)
                : []
            )
          )
        ),
        tap((vehicles) => {
          this.cartVehicles = vehicles;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calculateTotal(): number {
    return this.cartVehicles.reduce(
      (total, vehicle) => total + vehicle.price,
      0
    );
  }

  async removeFromCart(vehicle: VehicleWithId) {
    const { id, make, model } = vehicle;

    try {
      await this.homeService.removeFromCart(id);
      this.snackBar.open(`${make} ${model} removed from cart`, 'Close', {
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      this.snackBar.open(`Error removing ${make} ${model} from cart`, 'Close', {
        duration: 3000,
      });
    }
  }
}
