import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { MenuItem, ItemSize } from './menu-item.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'menu_item_id', type: 'uuid', nullable: true })
  menuItemId: string | null;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  // Chosen size for items with sizes; null for single-price items.
  @Column({ type: 'varchar', length: 10, nullable: true })
  size: ItemSize | null;

  // Label shown for the size at the time of ordering, e.g. "E gjatë".
  @Column({ name: 'size_label', type: 'varchar', nullable: true })
  sizeLabel: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => MenuItem, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItem | null;
}
