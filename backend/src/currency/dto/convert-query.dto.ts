import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

const toUpperTrim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

const trimValue = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export class ConvertQueryDto {
  @Transform(toUpperTrim)
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  from!: string;

  @Transform(toUpperTrim)
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  to!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? Number(value) : value,
  )
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0.01)
  amount!: number;

  @Transform(trimValue)
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;
}
