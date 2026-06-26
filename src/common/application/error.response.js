

export const ErrorException = ({ message = "Error", status = 400, extra = undefined } = {}) => {
    throw new Error(message, { cause: { status, extra } });
}



export const NotFoundException = ({ message = "Not Found",status=404, extra = undefined } = {}) => {
    return ErrorException({ message, status, extra });
}
export const BadRequestException = ({ message = "BadRequestException",  status=400,extra = undefined } = {}) => {
    return ErrorException({ message,status, extra });
}
export const UnauthorizedException = ({ message = "UnauthorizedException", status=401, extra = undefined } = {}) => {
    return ErrorException({ message, status, extra });
}
export const ConflictException = ({ message = "ConflictException", status=409, extra = undefined } = {}) => {
    return ErrorException({ message, status, extra });
}
export const ForbiddenException = ({ message = 'ForbiddenException', status=403,extra = undefined } = {}) => {
  return ErrorException({ message, status, extra })
};