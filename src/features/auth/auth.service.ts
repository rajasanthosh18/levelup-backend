import { supabase } from "../../common/supabase";
import type { User } from "../users/users.dao";
import { UsersDAO } from "../users/users.dao";

export class AuthService {
  private usersDAO: UsersDAO;

  constructor() {
    this.usersDAO = new UsersDAO();
  }

  /**
   * Verifies Supabase JWT and syncs user to app DB; returns app user or null
   */
  async verifyToken(token: string): Promise<User | null> {
    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      return null;
    }

    let appUser = await this.usersDAO.findById(supabaseUser.id);
    if (!appUser) {
      const name =
        supabaseUser.user_metadata?.full_name ??
        supabaseUser.user_metadata?.name ??
        null;
      appUser = await this.usersDAO.create({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: name ?? undefined,
      });
    }

    return appUser;
  }
}
