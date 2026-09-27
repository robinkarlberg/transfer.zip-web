const readEntry = async (entry, parentPath) => {
	if (entry.isFile) {
		const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
		// Mirror what a folder <input> sets, so the receiver's zip keeps the folder tree.
		if (parentPath) Object.defineProperty(file, "webkitRelativePath", { value: parentPath + file.name });
		return [file];
	}
	const reader = entry.createReader();
	const children = [];
	// readEntries hands out a directory in batches until it returns an empty one.
	while (true) {
		const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
		if (batch.length === 0) break;
		children.push(...batch);
	}
	const nested = await Promise.all(children.map(child => readEntry(child, parentPath + entry.name + "/")));
	return nested.flat();
};

/**
 * Files from a drop event, with dropped folders walked recursively.
 * Must be called synchronously inside the drop handler: the items are cleared once it returns.
 * @param {DataTransfer} dataTransfer
 */
export const readDroppedFiles = async (dataTransfer) => {
	// Files that don't live on disk (e.g. an image dragged from another tab) have no entry
	const sources = [...dataTransfer.items]
		.filter(item => item.kind === "file")
		.map(item => item.webkitGetAsEntry() || item.getAsFile());
	const nested = await Promise.all(sources.map(source => source instanceof File ? [source] : readEntry(source, "")));
	return nested.flat();
};
