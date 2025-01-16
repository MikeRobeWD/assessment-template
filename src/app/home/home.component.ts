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
import { parsePrice } from '@utils';

@Component({
  selector: 'app-home',
  standalone: true,
  providers: [HomeService],
  imports: [HomeModule, AsyncPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  public vehicles$: Observable<VehicleWithId[]> = from([]);
  public filteredVehicles$: Observable<VehicleWithId[]> = from([]);
  public destroy$ = new Subject<void>();
  private filterSubject = new BehaviorSubject<SelectedFilters>({
    manufacturer: 'Any',
  });

  constructor(private homeService: HomeService) {}

  ngOnInit() {
    this.vehicles$ = this.homeService
      .getVehicles()
      .pipe(takeUntil(this.destroy$));

    this.filteredVehicles$ = combineLatest([
      this.vehicles$,
      this.filterSubject.asObservable(),
    ]).pipe(
      map(
        ([vehicles, filters]) => vehicles
        // this.filterVehicles(vehicles, filters)
      ),
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
