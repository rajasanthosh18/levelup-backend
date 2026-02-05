import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { UsersDAO } from "../users/users.dao";

export interface SignupData {
  email: string;
  name?: string;
  password: string;
}

export interface LoginResult {
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  token: string;
}

export class AuthService {
  private usersDAO: UsersDAO;
  private jwtSecret: string;

  constructor() {
    this.usersDAO = new UsersDAO();
    this.jwtSecret = process.env.JWT_SECRET || "your-secret-key";
  }

  async signup(data: SignupData): Promise<LoginResult> {
    // Validation
    if (!data.email || !data.email.includes("@")) {
      throw new Error("Valid email is required");
    }

    if (!data.password || data.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Check if user already exists
    const existingUser = await this.usersDAO.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    // Create user
    const user = await this.usersDAO.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async login(email: string, password: string): Promise<LoginResult | null> {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Find user by email
    const user = await this.usersDAO.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Compare password with hashed password in DB
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  private generateToken(userId: number, email: string): string {
    return jwt.sign({ id: userId, email }, this.jwtSecret, {
      expiresIn: "24h",
    });
  }

  verifyToken(token: string): { id: number; email: string } | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as {
        id: number;
        email: string;
      };
      return decoded;
    } catch {
      return null;
    }
  }
}
