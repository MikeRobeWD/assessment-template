import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { VehicleWithId } from '@types';
import { HomeService } from '../../../_services/home.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../_store/app.state';
import { selectCartId } from '../../../_store/cart/cart.selectors';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrl: './car-list.component.scss',
})
export class CarListComponent implements OnInit, OnDestroy {
  @Input() vehicles: VehicleWithId[] = [];
  private destroy$ = new Subject<void>();
  public cartItems: string[] = [];

  constructor(
    private homeService: HomeService,
    private snackBar: MatSnackBar,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    // Subscribe to cart changes using switchMap to handle the nested subscription
    this.store
      .pipe(
        select(selectCartId),
        switchMap((cartId) => (cartId ? this.homeService.getCart() : [])),
        takeUntil(this.destroy$)
      )
      .subscribe((cart) => {
        if (cart) {
          this.cartItems = cart.items || [];
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isInCart(vehicleId: string): boolean {
    return this.cartItems.includes(vehicleId);
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
