import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

interface MappedError {
  status: number;
  message: string;
}

/**
 * Traduz os erros conhecidos do Prisma em respostas HTTP adequadas.
 * Sem isso qualquer violacao de unique/foreign key vira 500.
 */
@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const mapped = this.map(exception);

    if (!mapped) {
      this.logger.error(
        `Erro nao mapeado do Prisma (${exception.code}): ${exception.message}`,
      );
      return super.catch(exception, host);
    }

    host.switchToHttp().getResponse<Response>().status(mapped.status).json({
      statusCode: mapped.status,
      message: mapped.message,
      error: HttpStatus[mapped.status],
    });
  }

  private map(exception: PrismaClientKnownRequestError): MappedError | null {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: `Ja existe um registro com esse valor para: ${this.describeUniqueTarget(exception)}.`,
        };

      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Referencia invalida: o registro relacionado nao existe.',
        };

      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message:
            this.readString(exception, 'cause') ?? 'Registro nao encontrado.',
        };

      default:
        return null;
    }
  }

  /**
   * O Prisma 7 com driver adapter nao expoe mais `meta.target`; o nome da
   * constraint chega apenas dentro da mensagem original do driver, entre aspas
   * (ex.: `CuisineType_name_key`). Dai extraimos o(s) campo(s).
   */
  private describeUniqueTarget(
    exception: PrismaClientKnownRequestError,
  ): string {
    const target = exception.meta?.target;

    if (Array.isArray(target)) return target.map(String).join(', ');
    if (typeof target === 'string') return target;

    const constraint = this.extractConstraintName(exception);

    if (!constraint) return 'registro';

    const modelName = this.readString(exception, 'modelName');

    const fields = constraint
      .replace(/_key$/, '')
      .replace(modelName ? new RegExp(`^${modelName}_`) : /^$/, '');

    return fields.length > 0 ? fields.split('_').join(', ') : constraint;
  }

  private extractConstraintName(
    exception: PrismaClientKnownRequestError,
  ): string | null {
    const driverError = exception.meta?.driverAdapterError;

    if (typeof driverError !== 'object' || driverError === null) return null;

    const cause = (driverError as { cause?: unknown }).cause;

    if (typeof cause !== 'object' || cause === null) return null;

    const originalMessage = (cause as { originalMessage?: unknown })
      .originalMessage;

    if (typeof originalMessage !== 'string') return null;

    return /"([^"]+)"/.exec(originalMessage)?.[1] ?? null;
  }

  private readString(
    exception: PrismaClientKnownRequestError,
    key: string,
  ): string | null {
    const value = exception.meta?.[key];

    return typeof value === 'string' ? value : null;
  }
}
