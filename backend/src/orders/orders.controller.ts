import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderEventsService } from './order-events.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderEvents: OrderEventsService,
  ) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('status') status?: string, @Query('date') date?: string) {
    return this.ordersService.findAll(status, date);
  }

  // Admin-only live feed of order events (Server-Sent Events).
  // Declared before ':id' so it is not swallowed by ParseUUIDPipe.
  @UseGuards(JwtAuthGuard)
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.orderEvents.stream();
  }

  @UseGuards(JwtAuthGuard)
  @Get('alerts')
  findAlerts() {
    return this.ordersService.findAlerts();
  }

  // Public — UUID itself is the access token (122 bits entropy)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/acknowledge')
  acknowledge(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.acknowledge(id);
  }
}
