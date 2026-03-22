import { Injectable } from '@nestjs/common';
import { User } from './user';

@Injectable()
export class UserService {
  users: User[] = [
    {
      id: '1-00-1',
    },
    {
      id: '1-00-2',
    },
    {
      id: '1-00-3',
    },
  ];

  update(id: string, user: User) {
    this.users = this.users.map((p) => {
      if (p.id === id) {
        return user;
      } else {
        return p;
      }
    });
  }

  deleteById(id: string) {
    this.users = this.users.filter((p) => p.id !== id);
  }

  create(user: User) {
    this.users = [...this.users, user];
  }

  findById(code: string) {
    return this.users.find((p) => p.id === code);
  }

  findAll() {
    return this.users;
  }
}
