interface VehicleFilters {
  manufacturer: Filter;
  body?: Filter;
  priceRange?: { min: Filter; max: Filter };
}

interface Filter {
  options: string[];
}

interface SelectedFilters {
  manufacturer: string;
  bodyType?: string;
  priceRange?: { min: string; max: string };
}

export { VehicleFilters, SelectedFilters };
