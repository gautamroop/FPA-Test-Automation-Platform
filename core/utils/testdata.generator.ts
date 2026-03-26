import { v4 as uuid } from 'uuid';

export function generateUser() {
  const id = uuid();
  return {
    email: `test_${id}@mail.com`,
    name: `User_${id}`
  };
}

export function generateAddress() {
  const id = uuid().slice(0, 8);
  return {
    street: `${Math.floor(Math.random() * 9999) + 1} Test St`,
    city: 'Testville',
    state: 'CA',
    zip: '90001',
    country: 'US'
  };
}
