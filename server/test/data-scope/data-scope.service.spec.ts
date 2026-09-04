import type { DataScopeFilter } from '@nova/shared-types';
import { DataScopeService } from '../../src/modules/data-scope/data-scope.service';

function createMockQb() {
  const calls: Array<{ sql: string; params?: Record<string, unknown> }> = [];
  return {
    andWhere: jest.fn((sql: string, params?: Record<string, unknown>) => {
      calls.push({ sql, params });
      return mockQb;
    }),
    calls,
  };
}

let mockQb: ReturnType<typeof createMockQb>;

describe('DataScopeService filters', () => {
  let service: DataScopeService;

  beforeEach(() => {
    mockQb = createMockQb();
    service = new DataScopeService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  });

  describe('resolveDeptIdsForDeptApi', () => {
    it('all returns null', () => {
      expect(service.resolveDeptIdsForDeptApi({ type: 'all' }, '1')).toBeNull();
    });

    it('self returns user dept only', () => {
      expect(service.resolveDeptIdsForDeptApi({ type: 'self', userId: '9' }, '3')).toEqual([
        '3',
      ]);
      expect(service.resolveDeptIdsForDeptApi({ type: 'self', userId: '9' }, null)).toEqual([]);
    });

    it('depts returns configured ids', () => {
      const filter: DataScopeFilter = { type: 'depts', deptIds: ['2', '4'] };
      expect(service.resolveDeptIdsForDeptApi(filter, null)).toEqual(['2', '4']);
    });
  });

  describe('expandDeptIdsWithAncestors', () => {
    it('includes parent chain', () => {
      const expanded = service.expandDeptIdsWithAncestors(['3'], [
        { id: '1', parentId: '0' },
        { id: '2', parentId: '1' },
        { id: '3', parentId: '2' },
      ]);
      expect(expanded.sort()).toEqual(['1', '2', '3']);
    });
  });

  describe('applyDeptFilter', () => {
    it('none blocks all rows', () => {
      service.applyDeptFilter(mockQb as never, 'd', { type: 'none' }, null);
      expect(mockQb.andWhere).toHaveBeenCalledWith('1 = 0');
    });

    it('depts applies IN clause', () => {
      service.applyDeptFilter(
        mockQb as never,
        'd',
        { type: 'depts', deptIds: ['10'] },
        null,
      );
      expect(mockQb.calls[0]?.sql).toContain('d.id IN');
      expect(mockQb.calls[0]?.params).toEqual({ scopeDeptIds: ['10'] });
    });
  });

  describe('applyAuditLogFilter', () => {
    it('self matches user id or username-only rows', () => {
      service.applyAuditLogFilter(
        mockQb as never,
        'log',
        { type: 'self', userId: '7' },
        { userId: '7', username: 'alice' },
      );
      expect(mockQb.calls[0]?.sql).toContain('log.user_id = :scopeUserId');
      expect(mockQb.calls[0]?.params).toEqual({
        scopeUserId: '7',
        scopeUsername: 'alice',
      });
    });

    it('depts uses EXISTS subquery', () => {
      service.applyAuditLogFilter(
        mockQb as never,
        'log',
        { type: 'depts', deptIds: ['5'] },
        { userId: '1', username: 'bob' },
      );
      expect(mockQb.calls[0]?.sql).toContain('EXISTS');
      expect(mockQb.calls[0]?.params).toEqual({ scopeDeptIds: ['5'] });
    });
  });

  describe('filterSessionsByScope', () => {
    it('self keeps only current user sessions', async () => {
      const sessions = [
        { userId: '1', username: 'a' },
        { userId: '2', username: 'b' },
      ];
      const result = await service.filterSessionsByScope(sessions, {
        type: 'self',
        userId: '1',
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.userId).toBe('1');
    });
  });
});
