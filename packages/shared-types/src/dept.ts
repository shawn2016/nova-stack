/** 部门列表项 */
export interface DeptListItem {
  id: string;
  parentId: string;
  name: string;
  sort: number;
  leader: string | null;
  phone: string | null;
  status: 0 | 1;
  createdAt: string;
}

/** 部门树节点 */
export interface DeptTreeNode {
  id: string;
  parentId: string;
  name: string;
  sort: number;
  leader: string | null;
  phone: string | null;
  status: 0 | 1;
  children?: DeptTreeNode[];
}

/** 创建部门 */
export interface CreateDeptDto {
  parentId: string;
  name: string;
  sort?: number;
  leader?: string | null;
  phone?: string | null;
  status?: 0 | 1;
}

/** 更新部门 */
export interface UpdateDeptDto {
  parentId?: string;
  name?: string;
  sort?: number;
  leader?: string | null;
  phone?: string | null;
  status?: 0 | 1;
}

/** 部门模块功能开关 */
export interface DeptSettings {
  moduleEnabled: boolean;
  userBindingEnabled: boolean;
}

/** 更新部门功能开关 */
export interface UpdateDeptSettingsDto {
  moduleEnabled?: boolean;
  userBindingEnabled?: boolean;
}

/** 更新部门状态 */
export interface UpdateDeptStatusDto {
  status: 0 | 1;
}
