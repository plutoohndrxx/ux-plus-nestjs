import {
  Registry,
  RegistryCode,
  Users,
  Test,
} from '@/databases/mysql-database/model';
export const useClearMysql = async (
  models: (Registry | RegistryCode | Users | Test)[],
) => {
  for (const v of models) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await v.destroy({ where: {}, truncate: true });
  }
};
