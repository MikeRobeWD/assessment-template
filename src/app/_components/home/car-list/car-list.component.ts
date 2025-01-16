import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { VehicleWithId } from '@types';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrl: './car-list.component.scss',
})
export class CarListComponent implements OnInit, OnDestroy {
  @Input() vehicles: VehicleWithId[] = [];

  constructor() {}

  ngOnInit() {
    console.log(this.vehicles);
  }

  ngOnDestroy() {}
}
