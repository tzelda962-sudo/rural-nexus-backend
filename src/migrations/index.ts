import * as migration_20260621_095314_add_link_fields from './20260621_095314_add_link_fields';

export const migrations = [
  {
    up: migration_20260621_095314_add_link_fields.up,
    down: migration_20260621_095314_add_link_fields.down,
    name: '20260621_095314_add_link_fields'
  },
];
