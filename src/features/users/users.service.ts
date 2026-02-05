import { CreateUserData, UpdateUserData, User, UsersDAO } from "./users.dao";

export class UsersService {
  private usersDAO: UsersDAO;

  constructor() {
    this.usersDAO = new UsersDAO();
  }

  async getAllUsers(): Promise<User[]> {
    return await this.usersDAO.findAll();
  }

  async getUserById(id: number): Promise<User | null> {
    if (!id || id <= 0) {
      throw new Error("Invalid user ID");
    }
    return await this.usersDAO.findById(id);
  }

  async createUser(userData: CreateUserData): Promise<User> {
    // Business logic validation
    if (!userData.email || !userData.email.includes("@")) {
      throw new Error("Valid email is required");
    }

    // Check if user already exists
    const existingUser = await this.usersDAO.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    return await this.usersDAO.create(userData);
  }

  async updateUser(id: number, userData: UpdateUserData): Promise<User> {
    if (!id || id <= 0) {
      throw new Error("Invalid user ID");
    }

    if (userData.email && !userData.email.includes("@")) {
      throw new Error("Valid email is required");
    }

    // Check if email is already taken by another user
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

  async deleteUser(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new Error("Invalid user ID");
    }

    const deleted = await this.usersDAO.delete(id);
    if (!deleted) {
      throw new Error("User not found");
    }
  }
}
