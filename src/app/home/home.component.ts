import { Component, OnInit, OnDestroy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import {
  BehaviorSubject,
  combineLatest,
  from,
  map,
  Observable,
  Subject,
  takeUntil,
} from 'rxjs';

import { HomeService } from '../_services/home.service';
import { HomeModule } from '../_components/home/home.module';

import { SelectedFilters, VehicleWithId } from '@types';


@Component({
  selector: 'app-home',
  standalone: true,
  providers: [HomeService],
  imports: [HomeModule, AsyncPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public vehicles$: Observable<VehicleWithId[]> = from([]);
  public filteredVehicles$: Observable<VehicleWithId[]> = from([]);
  public destroy$ = new Subject<void>();
  private filterSubject = new BehaviorSubject<SelectedFilters>({
    manufacturer: 'Any',
    priceRange: { min: '0', max: '1300000' }, 
  });

  public priceOptions: string[] = Array.from(
    { length: 14 },
    (_, i) => (i * 100000).toString()
  );

  constructor(private homeService: HomeService) {}

  ngOnInit() {
    this.vehicles$ = this.homeService
      .getVehicles()
      .pipe(takeUntil(this.destroy$));

    this.filteredVehicles$ = combineLatest([
      this.vehicles$,
      this.filterSubject.asObservable(),
    ]).pipe(
      map(([vehicles, filters]) => {
        let filteredVehicles = vehicles;

        if (filters.manufacturer !== 'Any') {
          filteredVehicles = filteredVehicles.filter(
            (vehicle) => vehicle.make === filters.manufacturer
          );
        }

        if (filters.bodyType !== 'Any') {
          filteredVehicles = filteredVehicles.filter(
            (vehicle) => vehicle.body === filters.bodyType
          );
        }

        const minPrice = parseInt(filters.priceRange?.min || '0', 10);
        const maxPrice = parseInt(filters.priceRange?.max || '1300000', 10);

        filteredVehicles = filteredVehicles.filter((vehicle) => {
          const vehiclePrice = vehicle.price;
          return vehiclePrice >= minPrice && vehiclePrice <= maxPrice;
        });

        return filteredVehicles;
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilterChanged(filters: SelectedFilters): void {
    this.filterSubject.next(filters);
  }
}
