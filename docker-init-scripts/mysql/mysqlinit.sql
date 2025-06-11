CREATE DATABASE IF NOT EXISTS `platform` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `platform`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` char(36) NOT NULL,
  `nickname` varchar(20) NOT NULL COMMENT '昵称',
  `gender` tinyint DEFAULT NULL COMMENT '性别',
  `avatar` varchar(2048) NOT NULL COMMENT '用户头像地址',
  `createdAt` date DEFAULT NULL COMMENT '账号创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户信息表';

CREATE TABLE IF NOT EXISTS `registry` (
  `id` char(36) NOT NULL COMMENT '主键',
  `account` varchar(20) NOT NULL COMMENT '用户名',
  `password` text NOT NULL COMMENT '密码',
  `email` text NOT NULL COMMENT '邮箱',
  `secureid` char(36) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `registry_users_id_fk` FOREIGN KEY (`id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='账号管理';


CREATE TABLE IF NOT EXISTS `registrycode` (
  `email` varchar(255) NOT NULL,
  `code` text,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `test` (
  `id` char(36) NOT NULL,
  `message` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='单纯用于测试的表';