/** 字典类型列表项 */
export interface DictTypeListItem {
  id: string;
  name: string;
  code: string;
  status: number;
  remark?: string | null;
  createdAt: string;
}

/** 字典数据列表项 */
export interface DictDataListItem {
  id: string;
  typeId: string;
  typeCode?: string;
  label: string;
  value: string;
  sort: number;
  status: number;
  remark?: string | null;
}

/** 字典下拉选项 */
export interface DictOption {
  label: string;
  value: string;
  sort: number;
}

/** 创建字典类型请求 */
export interface CreateDictTypeDto {
  name: string;
  code: string;
  status?: number;
  remark?: string;
}

/** 更新字典类型请求 */
export interface UpdateDictTypeDto {
  name?: string;
  status?: number;
  remark?: string;
}

/** 创建字典数据请求 */
export interface CreateDictDataDto {
  typeId: string;
  label: string;
  value: string;
  sort?: number;
  status?: number;
  remark?: string;
}

/** 更新字典数据请求 */
export interface UpdateDictDataDto {
  label?: string;
  value?: string;
  sort?: number;
  status?: number;
  remark?: string;
}
