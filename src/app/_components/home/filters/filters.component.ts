import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Vehicle, SelectedFilters } from '@types';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent implements OnChanges {
  @Input() public vehicles!: Vehicle[];
  @Output() public filterChanged = new EventEmitter<SelectedFilters>();

  public filters: SelectedFilters = { manufacturer: 'Any', bodyType: 'Any', priceRange: { min: '0', max: '1300000' } };
  public manufacturerOptions: string[] = [];
  public bodyTypeOptions: string[] = [];
  public selectedManufacturer: string = 'Any';
  public selectedBodyType: string = 'Any';
  public selectedPriceRange = { min: '0', max: '1300000' };
  public priceOptions: string[] = this.createPriceRange(0, 1300000, 100000);

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['vehicles'] && this.vehicles) {
      this.initializeFilters();
    }
  }

  initializeFilters(): void {
    this.manufacturerOptions = [
      'Any',
      ...[...new Set(this.vehicles.map((vehicle) => vehicle.make))].sort(),
    ];
    this.bodyTypeOptions = [
      'Any',
      ...[...new Set(this.vehicles.map((vehicle) => vehicle.body))].sort(),
    ];
    this.filterChanged.emit({
      manufacturer: this.selectedManufacturer,
      bodyType: this.selectedBodyType,
      priceRange: this.selectedPriceRange,
    });
  }

  // Price range helper function
  createPriceRange(min: number, max: number, step: number): string[] {
    const range: string[] = [];
    for (let i = min; i <= max; i += step) {
      range.push(i.toString());
    }
    return range;
  }

  onFilterChange(): void {
    const filters: SelectedFilters = {
      manufacturer: this.selectedManufacturer,
      bodyType: this.selectedBodyType,
      priceRange: this.selectedPriceRange,
    };
    this.filterChanged.emit(filters);
  }

  getFilteredVehicles(): Vehicle[] {
    return this.vehicles.filter((vehicle) => {
      const manufacturerMatch = this.selectedManufacturer === 'Any' || vehicle.make === this.selectedManufacturer;
      const bodyTypeMatch = this.selectedBodyType === 'Any' || vehicle.body === this.selectedBodyType;

      const minPrice = parseInt(this.selectedPriceRange.min, 10);
      const maxPrice = parseInt(this.selectedPriceRange.max, 10);
      const priceMatch = vehicle.price >= minPrice && vehicle.price <= maxPrice;

      return manufacturerMatch && bodyTypeMatch && priceMatch;
    });
  }
}
