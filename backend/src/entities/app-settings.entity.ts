import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

// Single-row table (id = 1) holding menu-wide display settings.
@Entity('app_settings')
export class AppSettings {
  @PrimaryColumn({ type: 'int', default: 1 })
  id: number;

  // When false, the customer menu hides all item photos (photo data is kept).
  @Column({ name: 'show_images', type: 'boolean', default: true })
  showImages: boolean;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
