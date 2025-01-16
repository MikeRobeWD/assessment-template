import { createReducer, on } from '@ngrx/store';
import { setCartId } from './cart.actions';

export interface CartState {
  cartId: string | null;
}

export const initialState: CartState = {
  cartId: null,
};

export const cartReducer = createReducer(
  initialState,
  on(setCartId, (state, { cartId }) => ({ ...state, cartId }))
);
