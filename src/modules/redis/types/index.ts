import { FindOptions } from 'sequelize';
import { Model } from 'sequelize-typescript';

export type Where<M extends Model> = Pick<M, 'where'>;

export type UseFindParamsOpt = Partial<{
  /**
   * Lock the selected rows. Possible options are transaction.LOCK.UPDATE and transaction.LOCK.SHARE.
   * Postgres also supports transaction.LOCK.KEY_SHARE, transaction.LOCK.NO_KEY_UPDATE and specific model
   * locks with joins. See [transaction.LOCK for an example](transaction#lock)
   */
  attrs: string[];
  //   default:true
  parse: boolean;
  expiretime: number;
}> & { key: string } & Omit<FindOptions, 'attrs'>;

export type SelectAllResponse<T> = T[];
export type SelectOneResponse<T> = T | null;
