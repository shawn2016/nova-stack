jest.setTimeout(60000);

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  DATA_SCOPE_CUSTOM,
  DATA_SCOPE_DEPT,
  DATA_SCOPE_SELF,
  ErrorCode,
} from '@nova/shared-types';
import { createE2eApp, E2eAppContext } from '../auth/e2e-app.helper';

describe('Data Scope API (e2e)', () => {
  let ctx: E2eAppContext;
  let app: INestApplication<App>;
  let adminToken: string;

  async function login(username: string, password: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password });
    return res.body.data.tokens.accessToken;
  }

  async function assignListPermission(roleId: string): Promise<void> {
    await request(app.getHttpServer())
      .put(`/api/roles/${roleId}/permissions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ permissionCodes: ['system:user:list'] })
      .expect(200);
  }

  async function assignPermissions(
    roleId: string,
    permissionCodes: string[],
  ): Promise<void> {
    await request(app.getHttpServer())
      .put(`/api/roles/${roleId}/permissions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ permissionCodes })
      .expect(200);
  }

  function flattenDeptNames(
    nodes: { name: string; children?: typeof nodes }[],
  ): string[] {
    const names: string[] = [];
    for (const node of nodes) {
      names.push(node.name);
      if (node.children?.length) {
        names.push(...flattenDeptNames(node.children));
      }
    }
    return names;
  }

  async function createUserWithRole(options: {
    username: string;
    password: string;
    deptId?: string;
    roleId: string;
  }): Promise<string> {
    const createRes = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: options.username,
        password: options.password,
        nickname: options.username,
        status: 1,
        deptId: options.deptId,
      })
      .expect(201);

    const userId = createRes.body.data.id;

    await request(app.getHttpServer())
      .put(`/api/users/${userId}/roles`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ roleIds: [options.roleId] })
      .expect(200);

    return userId;
  }

  function findDeptByName(
    nodes: { id: string; name: string; children?: typeof nodes }[],
    name: string,
  ): string | undefined {
    for (const node of nodes) {
      if (node.name === name) return node.id;
      if (node.children?.length) {
        const found = findDeptByName(node.children, name);
        if (found) return found;
      }
    }
    return undefined;
  }

  beforeAll(async () => {
    ctx = await createE2eApp();
    app = ctx.app;
    adminToken = await login('admin', 'admin123');
  }, 60000);

  afterAll(async () => {
    await app?.close();
  });

  describe('Role data scope CRUD', () => {
    let roleId: string;
    let opsDeptId: string;

    beforeAll(async () => {
      const treeRes = await request(app.getHttpServer())
        .get('/api/depts/tree/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      opsDeptId = findDeptByName(treeRes.body.data, '运营部')!;
      expect(opsDeptId).toBeDefined();
    });

    it('POST /roles 应支持 dataScope', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E 本部门角色',
          code: 'e2e_dept_scope',
          status: 1,
          sort: 90,
          dataScope: DATA_SCOPE_DEPT,
        })
        .expect(201);

      expect(res.body.data.dataScope).toBe(DATA_SCOPE_DEPT);
      roleId = res.body.data.id;
    });

    it('GET /roles/:id 应返回 customDeptIds', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/roles/${roleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.customDeptIds).toEqual([]);
    });

    it('PUT /roles/:id 应更新为 CUSTOM 并保存部门', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/roles/${roleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dataScope: DATA_SCOPE_CUSTOM,
          customDeptIds: [opsDeptId],
        })
        .expect(200);

      expect(res.body.data.dataScope).toBe(DATA_SCOPE_CUSTOM);
      expect(res.body.data.customDeptIds).toEqual([opsDeptId]);
    });

    it('禁止修改 super_admin 数据范围', async () => {
      const rolesRes = await request(app.getHttpServer())
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const superAdmin = rolesRes.body.data.list.find(
        (r: { code: string }) => r.code === 'super_admin',
      );

      const res = await request(app.getHttpServer())
        .put(`/api/roles/${superAdmin.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ dataScope: DATA_SCOPE_SELF })
        .expect(400);

      expect(res.body.code).toBe(ErrorCode.BAD_REQUEST);
    });
  });

  describe('User list filtering', () => {
    let rndDeptId: string;
    let opsDeptId: string;
    let deptRoleId: string;
    let selfRoleId: string;
    let customRoleId: string;

    beforeAll(async () => {
      const treeRes = await request(app.getHttpServer())
        .get('/api/depts/tree/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      rndDeptId = findDeptByName(treeRes.body.data, '研发部')!;
      opsDeptId = findDeptByName(treeRes.body.data, '运营部')!;
      expect(rndDeptId).toBeDefined();
      expect(opsDeptId).toBeDefined();

      const deptRoleRes = await request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E 部门可见',
          code: 'e2e_scope_dept',
          dataScope: DATA_SCOPE_DEPT,
        })
        .expect(201);
      deptRoleId = deptRoleRes.body.data.id;
      await assignListPermission(deptRoleId);

      const selfRoleRes = await request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E 仅本人',
          code: 'e2e_scope_self',
          dataScope: DATA_SCOPE_SELF,
        })
        .expect(201);
      selfRoleId = selfRoleRes.body.data.id;
      await assignListPermission(selfRoleId);

      const customRoleRes = await request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E 自定义部门',
          code: 'e2e_scope_custom',
          dataScope: DATA_SCOPE_CUSTOM,
          customDeptIds: [opsDeptId],
        })
        .expect(201);
      customRoleId = customRoleRes.body.data.id;
      await assignListPermission(customRoleId);

      await createUserWithRole({
        username: 'scope_rnd_user',
        password: 'scope12345',
        deptId: rndDeptId,
        roleId: deptRoleId,
      });

      await createUserWithRole({
        username: 'scope_ops_user',
        password: 'scope12345',
        deptId: opsDeptId,
        roleId: deptRoleId,
      });

      await createUserWithRole({
        username: 'scope_self_user',
        password: 'scope12345',
        deptId: rndDeptId,
        roleId: selfRoleId,
      });

      await createUserWithRole({
        username: 'scope_custom_user',
        password: 'scope12345',
        deptId: rndDeptId,
        roleId: customRoleId,
      });
    });

    it('DEPT 范围仅返回同部门用户', async () => {
      const token = await login('scope_rnd_user', 'scope12345');

      const res = await request(app.getHttpServer())
        .get('/api/users?pageSize=100')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const usernames = res.body.data.list.map((u: { username: string }) => u.username);
      expect(usernames).toContain('scope_rnd_user');
      expect(usernames).not.toContain('scope_ops_user');
      expect(usernames).not.toContain('admin');
    });

    it('SELF 范围仅返回本人', async () => {
      const token = await login('scope_self_user', 'scope12345');

      const res = await request(app.getHttpServer())
        .get('/api/users?pageSize=100')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.list).toHaveLength(1);
      expect(res.body.data.list[0].username).toBe('scope_self_user');
    });

    it('CUSTOM 范围返回指定部门用户', async () => {
      const token = await login('scope_custom_user', 'scope12345');

      const res = await request(app.getHttpServer())
        .get('/api/users?pageSize=100')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const usernames = res.body.data.list.map((u: { username: string }) => u.username);
      expect(usernames).toContain('scope_ops_user');
      expect(usernames).not.toContain('scope_rnd_user');
      expect(usernames).not.toContain('admin');
    });
  });

  describe('Dept tree/list filtering', () => {
    let rndDeptId: string;
    let deptRoleId: string;

    beforeAll(async () => {
      const treeRes = await request(app.getHttpServer())
        .get('/api/depts/tree/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      rndDeptId = findDeptByName(treeRes.body.data, '研发部')!;
      expect(rndDeptId).toBeDefined();

      const deptRoleRes = await request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E 部门树可见',
          code: 'e2e_scope_dept_tree',
          dataScope: DATA_SCOPE_DEPT,
        })
        .expect(201);
      deptRoleId = deptRoleRes.body.data.id;
      await assignPermissions(deptRoleId, ['system:dept:list']);

      await createUserWithRole({
        username: 'scope_dept_tree_user',
        password: 'scope12345',
        deptId: rndDeptId,
        roleId: deptRoleId,
      });
    });

    it('DEPT 范围部门树仅含本部门及祖先', async () => {
      const token = await login('scope_dept_tree_user', 'scope12345');

      const res = await request(app.getHttpServer())
        .get('/api/depts/tree/all')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const names = flattenDeptNames(res.body.data);
      expect(names).toContain('研发部');
      expect(names).toContain('总公司');
      expect(names).not.toContain('运营部');
    });
  });

  describe('Audit log filtering', () => {
    let rndDeptId: string;
    let selfRoleId: string;

    beforeAll(async () => {
      const treeRes = await request(app.getHttpServer())
        .get('/api/depts/tree/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      rndDeptId = findDeptByName(treeRes.body.data, '研发部')!;

      const selfRoleRes = await request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E 审计仅本人',
          code: 'e2e_scope_audit_self',
          dataScope: DATA_SCOPE_SELF,
        })
        .expect(201);
      selfRoleId = selfRoleRes.body.data.id;
      await assignPermissions(selfRoleId, [
        'system:audit:login:list',
        'system:audit:oper:list',
      ]);

      await createUserWithRole({
        username: 'scope_audit_self_user',
        password: 'scope12345',
        deptId: rndDeptId,
        roleId: selfRoleId,
      });

      await login('scope_audit_self_user', 'scope12345');
      await login('admin', 'admin123');
    });

    it('SELF 范围登录日志仅返回本人', async () => {
      const token = await login('scope_audit_self_user', 'scope12345');

      const res = await request(app.getHttpServer())
        .get('/api/audit/login-logs?pageSize=100')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const usernames = res.body.data.list.map((item: { username: string }) => item.username);
      expect(usernames.every((name: string) => name === 'scope_audit_self_user')).toBe(true);
    });
  });

  describe('Online session filtering', () => {
    let rndDeptId: string;
    let opsDeptId: string;
    let deptRoleId: string;

    beforeAll(async () => {
      const treeRes = await request(app.getHttpServer())
        .get('/api/depts/tree/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      rndDeptId = findDeptByName(treeRes.body.data, '研发部')!;
      opsDeptId = findDeptByName(treeRes.body.data, '运营部')!;

      const deptRoleRes = await request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E 会话部门可见',
          code: 'e2e_scope_session_dept',
          dataScope: DATA_SCOPE_DEPT,
        })
        .expect(201);
      deptRoleId = deptRoleRes.body.data.id;
      await assignPermissions(deptRoleId, ['system:session:list']);

      await createUserWithRole({
        username: 'scope_session_rnd',
        password: 'scope12345',
        deptId: rndDeptId,
        roleId: deptRoleId,
      });

      await createUserWithRole({
        username: 'scope_session_ops',
        password: 'scope12345',
        deptId: opsDeptId,
        roleId: deptRoleId,
      });

      await login('scope_session_ops', 'scope12345');
    });

    it('DEPT 范围在线会话不含其他部门用户', async () => {
      const token = await login('scope_session_rnd', 'scope12345');

      const res = await request(app.getHttpServer())
        .get('/api/sessions/online?pageSize=100')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const usernames = res.body.data.list.map((item: { username: string }) => item.username);
      expect(usernames).toContain('scope_session_rnd');
      expect(usernames).not.toContain('scope_session_ops');
      expect(usernames).not.toContain('admin');
    });
  });
});
