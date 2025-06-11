import {
  Table,
  Model,
  Column,
  PrimaryKey,
  IsUUID,
  HasOne,
} from 'sequelize-typescript';
import { Registry } from './registry.model';

@Table({
  timestamps: true,
  createdAt: true,
  updatedAt: false,
  tableName: 'users',
})
export class Users extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Column
  declare id: string;

  @HasOne(() => Registry)
  declare registry: Registry;

  @Column
  declare nickName: string;

  @Column
  declare gender: string;

  @Column
  declare avatar: string;
}
