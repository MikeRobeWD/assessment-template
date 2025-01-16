import { createAction, props } from '@ngrx/store';

export const setCartId = createAction(
  '[Cart] Set Cart ID',
  props<{ cartId: string }>()
);
