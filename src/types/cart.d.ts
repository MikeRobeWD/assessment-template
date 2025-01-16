import { Timestamp } from 'firebase/firestore';

interface Cart {
  created: Timestamp;
  items: string[];
}

export { Cart };
