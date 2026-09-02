import { DataSource } from 'typeorm';

/** sqlite 兼容 DDL（实体使用 bigint，测试库用 INTEGER AUTOINCREMENT） */
export async function initE2eSchema(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS sys_user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(64) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      nickname VARCHAR(64) NOT NULL,
      avatar VARCHAR(512),
      status TINYINT NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS sys_role (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(64) NOT NULL,
      code VARCHAR(64) NOT NULL UNIQUE,
      status TINYINT NOT NULL DEFAULT 1,
      sort INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS sys_permission (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(64) NOT NULL,
      code VARCHAR(128) NOT NULL UNIQUE,
      type VARCHAR(16) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS sys_menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id BIGINT NOT NULL DEFAULT 0,
      name VARCHAR(64) NOT NULL,
      path VARCHAR(256),
      component VARCHAR(256),
      icon VARCHAR(64),
      type VARCHAR(16) NOT NULL,
      permission_code VARCHAR(128),
      sort INT NOT NULL DEFAULT 0,
      visible TINYINT NOT NULL DEFAULT 1,
      status TINYINT NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS sys_user_role (
      user_id BIGINT NOT NULL,
      role_id BIGINT NOT NULL,
      PRIMARY KEY (user_id, role_id)
    )
  `);

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS sys_role_permission (
      role_id BIGINT NOT NULL,
      permission_id BIGINT NOT NULL,
      PRIMARY KEY (role_id, permission_id)
    )
  `);

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS member_user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone VARCHAR(20) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      nickname VARCHAR(64) NOT NULL,
      avatar VARCHAR(512),
      status TINYINT NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS article (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(200) NOT NULL,
      summary VARCHAR(500) NOT NULL DEFAULT '',
      content TEXT NOT NULL,
      cover_url VARCHAR(512),
      status TINYINT NOT NULL DEFAULT 0,
      author_id BIGINT NOT NULL,
      published_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dataSource.query(`
    CREATE INDEX IF NOT EXISTS idx_article_status_published_at
    ON article (status, published_at)
  `);

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS sys_dict_type (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(64) NOT NULL,
      code VARCHAR(64) NOT NULL UNIQUE,
      status TINYINT NOT NULL DEFAULT 1,
      remark VARCHAR(255),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS sys_dict_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type_id BIGINT NOT NULL,
      label VARCHAR(64) NOT NULL,
      value VARCHAR(64) NOT NULL,
      sort INT NOT NULL DEFAULT 0,
      status TINYINT NOT NULL DEFAULT 1,
      remark VARCHAR(255),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (type_id, value)
    )
  `);
}
