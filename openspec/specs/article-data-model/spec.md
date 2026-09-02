# article-data-model Specification

## Purpose
TBD - created by archiving change demo-business-module. Update Purpose after archive.

## Requirements

### Requirement: article 表
系统 MUST 创建 article 表，字段含 id、title、summary、content、cover_url、status、author_id、published_at、created_at、updated_at。

#### Scenario: 表结构同步
- **WHEN** 非 production 环境启动或执行 seed
- **THEN** article 表存在且 title 非空约束生效
