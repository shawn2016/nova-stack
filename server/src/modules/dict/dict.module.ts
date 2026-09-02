import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysDictDataEntity, SysDictTypeEntity } from '../../database/entities';
import { DictDataController } from './dict-data.controller';
import { DictDataService } from './dict-data.service';
import { DictTypeController } from './dict-type.controller';
import { DictTypeService } from './dict-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([SysDictTypeEntity, SysDictDataEntity])],
  controllers: [DictTypeController, DictDataController],
  providers: [DictTypeService, DictDataService],
  exports: [DictTypeService, DictDataService],
})
export class DictModule {}
