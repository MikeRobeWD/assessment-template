import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';

export const selectCartState = (state: AppState) => state.cart;

export const selectCartId = createSelector(
  selectCartState,
  (cartState) => cartState.cartId
);
