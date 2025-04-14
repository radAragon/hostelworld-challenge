import { Controller, Get } from '@nestjs/common';

/**
 * Endpoint created just for experience
 */
@Controller()
export class RootController {
  @Get()
  getRoot(): string {
    return 'Welcome to the Record API';
  }
}
