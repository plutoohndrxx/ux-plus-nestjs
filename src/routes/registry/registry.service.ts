import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Registry } from '@/databases/mysql-database/model/registry.model';
import { Users } from '@/databases/mysql-database/model/users.model';
import { InjectModel } from '@nestjs/sequelize';
import { RegistryUserDto } from './dto/registry.dto';
import { ApiResponse } from '@/dto/api-response';
import { RegistryCodeService } from '@/routes/registry-code/registry-code.service';
import { UxPasswordService } from '@/modules/ux-password/ux-password.service';
import type { InsertRegistryAndUser } from './types/registry.service.inter';
import { generateDate, generateId, generateNickName } from '@/tools';
import { Transaction, WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class RegistryService {
  private readonly logger = new Logger(RegistryService.name);
  constructor(
    @InjectModel(Registry)
    public registryModel: typeof Registry,
    @InjectModel(Users)
    public usersModel: typeof Users,
    private readonly registryCodeService: RegistryCodeService,
    private readonly uxPasswordService: UxPasswordService,
    private readonly configService: ConfigService,
    public readonly sequelize: Sequelize,
  ) {}
  findOne(where?: WhereOptions<any>, attributes?: string[]) {
    return this.registryModel.findOne({
      where,
      attributes,
    });
  }
  fromAccountToUser(account: string, attributes?: string[]) {
    return this.registryModel.findOne({
      where: {
        account,
      },
      attributes,
    });
  }
  fromEmailToUser(email: string, attributes?: string[]) {
    return this.registryModel.findOne({
      where: {
        email,
      },
      attributes,
    });
  }
  /**
   * Perform the actual write operation to the registry and user tables
   *
   * @private
   * @async
   * @param {InsertRegistryAndUser} InsertRegistryAndUser
   * @returns {Promise<void>}
   */
  private async insertRegistryAndUser(
    insertRegistryAndUser: InsertRegistryAndUser,
  ) {
    const nickName = generateNickName();
    const gender = 1;
    const avatar = this.configService.get('USER_AVATAR');
    const createdAt = generateDate();
    let transaction: Transaction;
    const defaultUserInfo = {
      id: insertRegistryAndUser.id,
      nickName,
      gender,
      avatar,
      createdAt,
    };
    try {
      transaction = await this.sequelize.transaction();
      await this.usersModel.create(defaultUserInfo, { transaction });
      await this.registryModel.create(
        { ...insertRegistryAndUser },
        { transaction },
      );
      await transaction.commit();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (transaction) await transaction.rollback();
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async registryUser(registryUserDto: RegistryUserDto) {
    const { account, password, code: plainCode, email } = registryUserDto;
    // Check if the email has already been registered
    const isExistEmail = await this.fromEmailToUser(email);
    if (isExistEmail)
      throw new HttpException(
        'This email has already been used to register an account',
        HttpStatus.BAD_REQUEST,
      );
    // Check username uniqueness
    const isExistAccount = await this.fromAccountToUser(account);
    if (isExistAccount)
      throw new HttpException(
        'Username already exists',
        HttpStatus.BAD_REQUEST,
      );
    // verify the verification code
    await this.registryCodeService.verifyRegistryCode(email, plainCode);
    // start registration
    const id = generateId();
    const enPassword = this.uxPasswordService.encryptedPassword(password);
    const secureid = generateId();

    const value = {
      id,
      account,
      password: enPassword,
      email,
      secureid,
    };
    try {
      await this.insertRegistryAndUser(value);
      // delete the verification code
      await this.registryCodeService.removeEmailCode(email);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
    return new ApiResponse(HttpStatus.OK, 'Successfully registered');
  }
  /**
   * Update the secureid field in the registry table
   *
   * @async
   * @param {string} id
   * @param {string} secureid
   * @returns {boolean}
   */
  async updatedSecureId(id: string, secureid: string) {
    const [effect] = await this.registryModel.update(
      {
        secureid,
      },
      {
        where: {
          id,
        },
      },
    );
    return effect === 1;
  }
  /**
   * Update the password field in the registry table
   *
   * @async
   * @param {string} id
   * @param {string} password
   * @returns {boolean}
   */
  async updatePassword(id: string, password: string) {
    const secureid = generateId();
    const [effect] = await this.registryModel.update(
      {
        password,
        secureid,
      },
      {
        where: {
          id,
        },
      },
    );
    return effect === 1;
  }
  async closeAccount(id: string) {
    const transaction = await this.sequelize.transaction();
    const accountIsExist = await this.findOne(
      {
        id,
      },
      ['id'],
    );
    if (!accountIsExist)
      throw new HttpException('Account does not exist', HttpStatus.BAD_REQUEST);
    const regisryRows = await this.registryModel.destroy({
      where: {
        id,
      },
    });
    const message = 'Failed to delete account';

    if (regisryRows !== 1)
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    const usersRows = await this.usersModel.destroy({
      where: {
        id,
      },
    });
    if (usersRows !== 1)
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    await transaction.commit();
    return true;
  }
}
