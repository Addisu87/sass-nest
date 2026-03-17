import { PartialType } from '@nestjs/swagger';
import { CreateMathDto } from './create-math.dto';

export class UpdateMathDto extends PartialType(CreateMathDto) {
  id: number;
}
