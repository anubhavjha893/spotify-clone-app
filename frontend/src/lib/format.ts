export const formatTime = (seconds: number) => {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const minutes = Math.floor(seconds / 60);
	const remaining = Math.floor(seconds % 60);
	return `${minutes}:${remaining.toString().padStart(2, "0")}`;
};

// "1 hr 12 min", "23 min 5 sec"
export const formatTotalDuration = (seconds: number) => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) return `${hours} hr ${minutes} min`;
	if (minutes > 0) return `${minutes} min ${secs} sec`;
	return `${secs} sec`;
};

export const pluralize = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export const greeting = (date = new Date()) => {
	const hour = date.getHours();
	if (hour < 5) return "Good evening";
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
};
