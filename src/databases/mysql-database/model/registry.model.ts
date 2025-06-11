import {
  Column,
  Table,
  IsUUID,
  PrimaryKey,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Users } from './users.model';

@Table({
  tableName: 'registry',
})
export class Registry extends Model {
  @IsUUID(4)
  @PrimaryKey
  @ForeignKey(() => Users)
  @Column
  declare id: string;

  @BelongsTo(() => Users)
  declare users: Users;

  @Column({ unique: true })
  declare account: string;

  @Column(DataType.TEXT)
  declare password: string;

  @Column(DataType.TEXT)
  declare email: string;

  @IsUUID(4)
  @Column(DataType.CHAR)
  declare secureid: string;
}
