import {
  Column,
  Table,
  Model,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';

@Table({
  tableName: 'registrycode',
})
export class RegistryCode extends Model {
  @PrimaryKey
  @Column
  declare email: string;

  @Column(DataType.TEXT)
  declare code: string;
}
