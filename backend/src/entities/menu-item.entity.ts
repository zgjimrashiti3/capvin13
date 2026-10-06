import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';

export const ITEM_SIZES = ['small', 'medium', 'large'] as const;
export type ItemSize = (typeof ITEM_SIZES)[number];
export type SizePrices = Record<ItemSize, number>;
export type SizeLabels = Record<ItemSize, string>;

export const DEFAULT_SIZE_LABELS: SizeLabels = {
  small: 'E vogël',
  medium: 'E mesme',
  large: 'E madhe',
};

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  // Items with sizes (e.g. espresso) are priced per size; `price` then holds the lowest size price.
  @Column({ name: 'has_sizes', type: 'boolean', default: false })
  hasSizes: boolean;

  @Column({ name: 'size_prices', type: 'jsonb', nullable: true })
  sizePrices: SizePrices | null;

  // Per-item display names for the sizes (espresso: E shkurtër / E mesme / E gjatë).
  // Null means DEFAULT_SIZE_LABELS.
  @Column({ name: 'size_labels', type: 'jsonb', nullable: true })
  sizeLabels: SizeLabels | null;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
