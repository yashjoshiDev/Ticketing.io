import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // If it's already an HTTP exception (thrown by the Gateway itself)
        if (exception instanceof HttpException) {
            return response.status(exception.getStatus()).json(exception.getResponse());
        }

        // If it's a Microservice error (TCP) forwarded to the Gateway
        // We look for a 'status' or 'statusCode' in the error object sent via TCP
        const status = exception.status || exception.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception.message || 'Internal server error';

        response.status(status).json({
            statusCode: status,
            message: message,
            timestamp: new Date().toISOString(),
        });
    }
}