import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Vehicle, VehicleFilters, SelectedFilters } from '@types';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
})
export class FiltersComponent implements OnChanges {
  @Input() public vehicles!: Vehicle[];
  @Output() public filterChanged = new EventEmitter<SelectedFilters>();

  public filters: VehicleFilters = {
    manufacturer: { options: [] },
    body: { options: [] },
  };

  public filterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      manufacturer: ['Any'],
      bodyType: ['Any'],
      priceRange: this.fb.group({
        min: [null],
        max: [null],
      }),
    });

    // Initialize with default values
    this.emitCurrentFilters();

    // Subscribe to form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.emitCurrentFilters();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['vehicles'] && this.vehicles) {
      this.initializeFilters();
    }
  }

  private emitCurrentFilters() {
    const formValue = this.filterForm.value;
    const filters: SelectedFilters = {
      manufacturer: formValue.manufacturer,
      bodyType: formValue.bodyType,
      priceRange: {
        min:
          formValue.priceRange.min === null
            ? 'Any'
            : formValue.priceRange.min.toString(),
        max:
          formValue.priceRange.max === null
            ? 'Any'
            : formValue.priceRange.max.toString(),
      },
    };
    this.filterChanged.emit(filters);
  }

  initializeFilters(): void {
    // Manufacturer options
    this.filters.manufacturer.options = [
      ...new Set(
        ['Any', ...this.vehicles.map((vehicle) => vehicle.make)].sort()
      ),
    ];

    // Body type options
    this.filters.body!.options = [
      ...new Set(
        ['Any', ...this.vehicles.map((vehicle) => vehicle.body)].sort()
      ),
    ];
  }
}
