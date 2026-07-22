import { getDependency } from "../libs/dependencies.js";
import { InvalidArgumentException } from "../exceptions/invalid_arguments_exception.js";
import { normalizeRole } from "../config/roles.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

function normalizeUserRoles(user) {
  if (!user || !Array.isArray(user.roles)) {
    return user;
  }

  user.roles = user.roles.map(normalizeRole);
  return user;
}

export class UserService {
  static async getSingleOrNullByUsername(username) {
    const UserModel = getDependency('UserModel');
    const user = (await UserModel.find({ username }))[0];
    return normalizeUserRoles(user);
  }

  static async get() {
    const UserModel = getDependency('UserModel');
    const users = await UserModel.find({});
    return users.map(normalizeUserRoles);
  }

  static async create(user) {
    if (!user.username) {
      throw new InvalidArgumentException('Falta el parámetro username.');
    }

    if (!user.fullName) {
      throw new InvalidArgumentException('Falta el parámetro fullName.');
    }

    if (!user.email) {
      throw new InvalidArgumentException('Falta el parámetro email.');
    }

    if (user.roles && !Array.isArray(user.roles)) {
      throw new InvalidArgumentException('El parámetro roles dbe ser una lista.');
    }

    if (Array.isArray(user.roles)) {
      user.roles = user.roles.map(normalizeRole);
    }

    const UserModel = getDependency('UserModel');
    const existingUser = await  UserModel.find({ username: user.username });
    if (existingUser.length > 0) {
      throw new InvalidArgumentException('Ese usuario ya existe.');
    }

    if (user.password) {
      user.hashedPassword = bcrypt.hashSync(user.password, 10);
      delete user.password;
    }
    
    user.uuid = crypto.randomUUID();

    const newUser = new UserModel(user);
    await newUser.save();

    return newUser;
  }

  static async deleteByUuid(uuid) {
    if (!uuid) {
      throw new InvalidArgumentException('Falta el parámetro uuid.');
    }

    const UserModel = getDependency('UserModel');
    const user = await UserModel.findOneAndDelete({ uuid });
    if (!user) {
      throw new InvalidArgumentException('Usuario no encontrado.');
    }
  }

}