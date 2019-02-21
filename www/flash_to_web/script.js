const form = document.body.querySelector("#form");
const panel = form.querySelector("#panel");
let data;
const alignToByte = () => {
	if(bit > 0) {
		byte++;
		bit = 0;
	}
};
const SWF = {
	SI8: () => { // Signed 8-bit integer value
		const byte = SWF.UI8();
		return byte >> 7 ? byte - (1 << 8) : byte;
	},
	SI16: () => { // Signed 16-bit integer value
		const byte = SWF.UI16();
		return byte >> 15 ? byte - (1 << 16) : byte;
	},
	SI32: () => { // Signed 32-bit integer value
		alignToByte();
		const byte = SWF.UI32();
		return byte >> 31 ? byte - (1 << 32) : byte;
	},
	SI8Array: n => { // Signed 8-bit array
		alignToByte();
		
	},
	SI16Array: n => { // Signed 16-bit array
		alignToByte();
		
	},
	UI8: () => { // Unsigned 8-bit integer value
		alignToByte();
		return data.bytes[data.byte++];
	},
	UI16: () => { // Unsigned 16-bit integer value
		alignToByte();
		return data.bytes[data.byte++] | data.bytes[data.byte++] << 8;
	},
	UI32: () => { // Unsigned 32-bit integer value
		alignToByte();
		return ((data.bytes[data.byte++] | data.bytes[data.byte++] << 8) | data.bytes[data.byte++] << 16) | data.bytes[data.byte++] << 24;
	},
	UI8Array: n => { // Unsigned 8-bit array
		alignToByte();
		
	},
	UI16Array: n => { // Unsigned 16-bit array
		alignToByte();
		
	},
	UI24Array: n => { // Unsigned 24-bit array
		alignToByte();
		
	},
	UI32Array: n => { // Unsigned 32-bit array
		alignToByte();
		
	},
	FIXED: () => { // 32-bit 16.16 fixed-point number
		alignToByte();
		
	},
	FIXED8: () => { // 16-bit 8.8 fixed-point number
		alignToByte();
		
	},
	FLOAT16: () => { // Half-prevision (16-bit) floating-point number
		alignToByte();
		
	},
	FLOAT: () => { // Half-prevision (32-bit) IEEE Standard 754 compatible
		alignToByte();
		
	},
	DOUBLE: () => { // Half-prevision (64-bit) IEEE Standard 754 compatible
		alignToByte();
		
	},
	EncodedU32: () => { // Variable length encoded 32-bit unsigned integer
		alignToByte();
		
	},
	SB: nBits => { // Signed-bit value
		
	},
	UB: nBits => { // Unsigned-bit value
		
	},
	FB: nBits => { // Signed, fixed-point bit value
		
	}
};
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "application/x-shockwave-flash";
fileInput.addEventListener("change", () => {
	panel.classList.add("hidden");
	Miro.formState(form, false);
	Miro.progress.open();
	const reader = new FileReader();
	reader.addEventListener("loadend", () => {
		data = {
			array: new Uint8Array(reader.result),
			file: {}
		};
		try {
			data.file.Signature = String.fromCharCode(...data.array.slice(0, 3));
			if(data.file.Signature.slice(1) !== "WS") {
				throw new Error("Invalid SWF signature");
			}
			const compression = data.file.Signature[0];
			if(compression === "F") {
				data.bytes = data.array.slice(8);
			} else if(compression === "C") {
				data.bytes = pako.inflate(data.array.slice(8));
			} else if(compression === "Z") {
				const result = LZMA.decompress(data.array.slice(8));
				if(typeof result === "string") {
					data.bytes = new Uint8Array(result.length);
					for(let i = 0; i < result.length; i++) {
						data.bytes[i] = result[i].charCodeAt();
					}
				} else {
					data.bytes = result;
				}
			} else {
				throw new Error("Unsupported compression method");
			}
			data.file.Version = data.array[3];
			data.file.FileLength = ((data.array[4] | data.array[5] << 8) | data.array[6] << 16) | data.array[7] << 24;
			data.byte = 0;
			data.bit = 0;
			panel.classList.remove("hidden");
		} catch(err) {
			new Miro.Dialog("Error", html`An error occurred while trying to read the SWF file.<br>$${err}`);
		}
		console.log(data);
		Miro.formState(form, true);
		Miro.progress.close();
	});
	reader.readAsArrayBuffer(fileInput.files[0]);
	fileInput.value = null;
});
form.elements.import.addEventListener("click", fileInput.click.bind(fileInput));
form.addEventListener("submit", evt => {
	evt.preventDefault();
	html`<a href="$${URL.createObjectURL(new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${html.escape(form.elements.title.value)}</title></head><body></body></html>`], {
		type: "text/html"
	}))}" download="$${form.elements.title.value}.html"></a>`.click();
});
