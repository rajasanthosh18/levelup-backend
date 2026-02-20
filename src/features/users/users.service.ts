import { randomUUID } from "crypto";
import { CreateUserData, UpdateUserData, User, UsersDAO } from "./users.dao";

export class UsersService {
  private usersDAO: UsersDAO;

  constructor() {
    this.usersDAO = new UsersDAO();
  }

  async getAllUsers(): Promise<User[]> {
    return await this.usersDAO.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    if (!id) {
      throw new Error("Invalid user ID");
    }
    return await this.usersDAO.findById(id);
  }

  async createUser(userData: { email: string; name?: string }): Promise<User> {
    if (!userData.email || !userData.email.includes("@")) {
      throw new Error("Valid email is required");
    }

    const existingUser = await this.usersDAO.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const data: CreateUserData = {
      id: randomUUID(),
      email: userData.email,
      name: userData.name,
    };
    return await this.usersDAO.create(data);
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    if (!id) {
      throw new Error("Invalid user ID");
    }

    if (userData.email && !userData.email.includes("@")) {
      throw new Error("Valid email is required");
    }

    if (userData.email) {
      const existingUser = await this.usersDAO.findByEmail(userData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error("Email is already taken by another user");
      }
    }

    const updatedUser = await this.usersDAO.update(id, userData);
    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    if (!id) {
      throw new Error("Invalid user ID");
    }

    const deleted = await this.usersDAO.delete(id);
    if (!deleted) {
      throw new Error("User not found");
    }
  }
}
