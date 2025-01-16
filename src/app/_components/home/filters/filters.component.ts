import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import { Vehicle, VehicleFilters } from '@types';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
})
export class FiltersComponent implements OnChanges {
  @Input() public vehicles!: Vehicle[];
  @Output() public filterChanged = new EventEmitter();

  public filters: VehicleFilters = {
    manufacturer: { options: [] },
  };

  public selectedManufacturer: string = 'Any';

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['vehicles'] && this.vehicles) {
      this.initializeFilters();
    }
    console.log(this.filters);
  }

  initializeFilters(): void {
    this.filters.manufacturer.options = [
      ...new Set(
        ['Any', ...this.vehicles.map((vehicle) => vehicle.make)].sort()
      ),
    ];
  }
}
