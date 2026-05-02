import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdateUserDto extends OmitType(CreateUserDto, ["password"] as const) {

    @IsNotEmpty({ message: 'ID không được để trống' })
    @IsMongoId({ message: 'ID không hợp lệ' })
    id: string
}
