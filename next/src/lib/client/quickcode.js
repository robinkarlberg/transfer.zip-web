// Short numeric pairing codes for Quick Transfers. A code is registered on the
// relay as a session id in its own namespace ("c." + 6 digits = exactly 8 chars),
// so the relay wire format is unchanged. Codes are one-shot: the relay marks the
// session claimed on the first connect.

export const CODE_LENGTH = 6;
export const CODE_SESSION_PREFIX = "c.";

export const generateQuickCode = () => {
	// Rejection-sample below the largest multiple of 10^6 to avoid modulo bias.
	let n;
	do {
		n = crypto.getRandomValues(new Uint32Array(1))[0];
	} while (n >= 4_294_000_000);
	return String(n % 1_000_000).padStart(CODE_LENGTH, "0");
};

export const codeToSessionId = (code) => CODE_SESSION_PREFIX + code;

export const formatQuickCode = (code) => code.slice(0, 3) + " " + code.slice(3);

/** Extracts a code from user input ("712 394", "712-394"), or null if invalid. */
export const parseQuickCodeInput = (input) => {
	const digits = (input || "").replace(/\D/g, "");
	return digits.length === CODE_LENGTH ? digits : null;
};
