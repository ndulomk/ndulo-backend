import { BadRequestException } from "./domain";

export async function IdMandatory(id: string){
  if(!id || id.trim() === ''){
    throw new BadRequestException("ID é obrigatório");
  }
}