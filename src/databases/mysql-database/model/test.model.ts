import {
  Column,
  Table,
  Model,
  PrimaryKey,
  DataType,
  IsUUID,
} from 'sequelize-typescript';

@Table({
  tableName: 'test',
})
export class Test extends Model {
  @PrimaryKey
  @IsUUID(4)
  @Column(DataType.CHAR)
  declare id: string;

  @Column(DataType.CHAR(200))
  declare message: string;
}
