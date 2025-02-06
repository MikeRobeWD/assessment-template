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
})
export class NavBarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public cartId$: Observable<string | null>;
  public cart: string[] = [];
  public cartVehicles: VehicleWithId[] = [];
  public formatToCurrency = formatToCurrency;

  constructor(
    private homeService: HomeService,
    private store: Store<AppState>,
    private snackBar: MatSnackBar
  ) {
    this.cartId$ = this.store.pipe(select(selectCartId));
  }

  ngOnInit() {
    this.cartId$
      .pipe(
        filter((cartId) => !!cartId),
        switchMap(() =>
          this.homeService.getCart().pipe(
            map((cart: Cart | null) => cart?.items ?? []),
            switchMap((cartItems: string[]) => {
              this.cart = cartItems;
              if (cartItems.length === 0) {
                this.cartVehicles = [];
                return [];
              }
              return this.homeService.getVehiclesByIds(cartItems);
            })
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

  async removeFromCart(vehicle: VehicleWithId) {
    try {
      await this.homeService.removeFromCart(vehicle.id);
      this.snackBar.open(`${vehicle.make} ${vehicle.model} removed from cart!`, 'Close', {
        duration: 3000,
      });
      this.cartVehicles = this.cartVehicles.filter((v) => v.id !== vehicle.id);
    } catch (error) {
      console.error('Error removing vehicle from cart', error);
      this.snackBar.open(`Error removing ${vehicle.make} ${vehicle.model} from cart.`, 'Close', {
        duration: 3000,
      });
    }
  }
}
