// Read a video's display width and height from its MP4/QuickTime header, so a
// post can size the <video> before it loads (see video-media.js).
//
// Both formats are a tree of boxes: a 4-byte size, a 4-byte type, then the
// payload. The size is in each video track's track header, moov > trak > tkhd.
// Audio tracks have a 0x0 tkhd, which is how the video track is told apart.
//
// Only the top-level box headers and the moov box are read, since the media
// data around them can be most of the file, and moov may come after it.
//
// Returns { width, height }, or null if the file cannot be read or is not an
// MP4/QuickTime file. Rendering then falls back to sizing the video once its
// metadata loads.
import fs from "node:fs";

// Parse the box header at `offset`. A size of 1 means a 64-bit size follows the
// type, and 0 means the box runs to the end of its container, which is
// `remaining` bytes away. Returns null for a size too small to hold the header.
function readBoxHeader(buffer, offset, remaining) {
	let size = buffer.readUInt32BE(offset);
	const type = buffer.toString("latin1", offset + 4, offset + 8);
	let header = 8;
	if (size === 1) {
		size = Number(buffer.readBigUInt64BE(offset + 8));
		header = 16;
	} else if (size === 0) {
		size = remaining;
	}
	return size < header ? null : { type, size, header };
}

function readBoxes(buffer, start, end, visit) {
	let offset = start;
	while (offset + 8 <= end) {
		const box = readBoxHeader(buffer, offset, end - offset);
		if (!box || offset + box.size > end) return;
		if (visit(box.type, offset + box.header, offset + box.size) === false) return;
		offset += box.size;
	}
}

// Find the moov box by reading only the headers of the boxes before it.
function readMoov(fd, fileSize) {
	const headerBuffer = Buffer.alloc(16);
	let offset = 0;
	while (offset + 8 <= fileSize) {
		fs.readSync(fd, headerBuffer, 0, 16, offset);
		const box = readBoxHeader(headerBuffer, 0, fileSize - offset);
		if (!box) return null;
		if (box.type === "moov") {
			const moov = Buffer.alloc(box.size - box.header);
			fs.readSync(fd, moov, 0, moov.length, offset + box.header);
			return moov;
		}
		offset += box.size;
	}
	return null;
}

function readTkhd(buffer, start) {
	// version (1 byte) and flags (3), then times and IDs whose width depends on
	// the version, then 16 bytes of reserved/layer/volume fields.
	const version = buffer.readUInt8(start);
	const matrix = start + 4 + (version === 1 ? 32 : 20) + 16;
	const sizeOffset = matrix + 36;
	if (sizeOffset + 8 > buffer.length) return null;

	// 16.16 fixed point.
	let width = buffer.readUInt32BE(sizeOffset) / 65536;
	let height = buffer.readUInt32BE(sizeOffset + 4) / 65536;
	if (!width || !height) return null;

	// A rotation of 90 or 270 degrees zeroes the matrix's a and d terms, and the
	// player then shows the stored width as the height.
	const a = buffer.readInt32BE(matrix);
	const d = buffer.readInt32BE(matrix + 16);
	if (a === 0 && d === 0) [width, height] = [height, width];

	return { width: Math.round(width), height: Math.round(height) };
}

export default function videoDimensions(filePath) {
	let fd;
	try {
		fd = fs.openSync(filePath, "r");
		const moov = readMoov(fd, fs.fstatSync(fd).size);
		if (!moov) return null;

		let dimensions = null;
		readBoxes(moov, 0, moov.length, (type, start, end) => {
			if (type !== "trak") return;
			readBoxes(moov, start, end, (type, start) => {
				if (type !== "tkhd") return;
				dimensions = readTkhd(moov, start);
				return false;
			});
			if (dimensions) return false;
		});
		return dimensions;
	} catch {
		return null;
	} finally {
		if (fd !== undefined) fs.closeSync(fd);
	}
}
