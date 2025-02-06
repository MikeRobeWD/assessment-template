import { Component, Input, OnDestroy, OnInit, OnChanges } from '@angular/core';
import { VehicleWithId } from '@types';
import { HomeService } from '../../../_services/home.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.scss'],
})
export class CarListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() vehicles: VehicleWithId[] = [];
  @Input() selectedManufacturer: string = 'Any';

  public filteredVehicles: VehicleWithId[] = [];
  public isInCart: { [key: string]: boolean } = {};

  constructor(
    private homeService: HomeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.filterVehicles();
    this.checkVehiclesInCart();
  }

  ngOnChanges() {
    this.filterVehicles();
    this.checkVehiclesInCart();
  }

  ngOnDestroy() {}

  filterVehicles(): void {
    if (this.selectedManufacturer === 'Any') {
      this.filteredVehicles = this.vehicles;
    } else {
      this.filteredVehicles = this.vehicles.filter(
        (vehicle) => vehicle.make === this.selectedManufacturer
      );
    }
  }

  async checkVehiclesInCart() {
    for (const vehicle of this.filteredVehicles) {
      this.isInCart[vehicle.id] = await this.homeService.isVehicleInCart(vehicle.id);
    }
  }

  async addToCart(vehicleId: string) {
    try {
      await this.homeService.addToCart(vehicleId);
      this.snackBar.open('Vehicle added to cart', 'Close', { duration: 3000 });
      this.isInCart[vehicleId] = true;
    } catch (error) {
      console.error('Error adding vehicle to cart', error);
      this.snackBar.open('Error adding vehicle to cart', 'Close', { duration: 3000 });
    }
  }

  async removeFromCart(vehicleId: string) {
    try {
      await this.homeService.removeFromCart(vehicleId);
      this.snackBar.open('Vehicle removed from cart', 'Close', { duration: 3000 });
      this.isInCart[vehicleId] = false;
    } catch (error) {
      console.error('Error removing vehicle from cart', error);
      this.snackBar.open('Error removing vehicle from cart', 'Close', { duration: 3000 });
    }
  }
}
