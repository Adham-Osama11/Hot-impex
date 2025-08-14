class ApiResponse {
    static success(data, message = 'Success', statusCode = 200) {
        return {
            status: 'success',
            statusCode,
            message,
            data
        };
    }

    static error(message = 'Error', statusCode = 500, errors = null) {
        const response = {
            status: 'error',
            statusCode,
            message
        };

        if (errors) {
            response.errors = errors;
        }

        return response;
    }

    static paginated(data, pagination, message = 'Success') {
        return {
            status: 'success',
            message,
            data,
            pagination
        };
    }
}

module.exports = ApiResponse;
