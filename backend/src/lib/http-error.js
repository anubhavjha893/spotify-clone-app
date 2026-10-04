export const httpError = (status, message) => {
	const error = new Error(message);
	error.status = status;
	return error;
};

// mongoose.isValidObjectId also accepts any 12 character string, so check the
// canonical 24 character hex form instead.
export const isValidId = (id) => typeof id === "string" && /^[a-f\d]{24}$/i.test(id);
