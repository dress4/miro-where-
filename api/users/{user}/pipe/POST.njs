const {user, isMe} = await parseUser(this);
if (isMe) {
	let data;
	try {
		data = JSON.parse(decodeURI(this.req.get("X-Data")));
	} catch {
		this.value = {
			error: "The `X-Data` header must be valid URI-encoded JSON."
		};
		this.status = 400;
		this.done();
		return;
	}
	let parent = null;
	if (typeof data.parent === "string") {
		if (!(parent = user.pipe.find(item => item.type === "/" && item.id === data.parent))) {
			this.value = {
				error: "That parent directory does not exist."
			};
			this.status = 422;
			this.done();
			return;
		}
	} else if (data.parent !== null) {
		this.value = {
			error: "The `parent` value must be a string or null."
		};
		this.status = 400;
		this.done();
		return;
	}
	if (typeof data.name === "string") {
		data.name = data.name.trim();
		if (data.name.length < 1) {
			this.value = {
				error: "The `name` value must be at least 1 character long."
			};
			this.status = 400;
			this.done();
			return;
		} else if (data.name.length > 255) {
			this.value = {
				error: "The `name` value must be at most 255 characters long."
			};
			this.status = 400;
			this.done();
			return;
		} else if (data.name.includes("/")) {
			this.value = {
				error: "The `name` value cannot include slashes."
			};
			this.status = 400;
			this.done();
			return;
		} else if (data.parent !== "trash" && user.pipe.some(item => item.parent === data.parent && item.name === data.name)) {
			this.value = {
				error: "That name is already taken."
			};
			this.status = 422;
			this.done();
			return;
		}
	} else {
		this.value = {
			error: "The `name` value must be a string."
		};
		this.status = 400;
		this.done();
		return;
	}
	let typeDir = false;
	if (data.type !== undefined) {
		if (typeof data.type === "string") {
			data.type = data.type.trim();
			if (data.type === "/") {
				typeDir = true;
			} else if (data.type.length > 255) {
				this.value = {
					error: "The `type` value must be at most 255 characters long."
				};
				this.status = 400;
				this.done();
				return;
			} else if (!mimeTest.test(data.type)) {
				this.value = {
					error: 'The `type` value must be "/" or a valid MIME type.'
				};
				this.status = 400;
				this.done();
				return;
			} else {
				data.type = data.type.toLowerCase();
			}
		} else {
			this.value = {
				error: "The `type` value must be a string."
			};
			this.status = 400;
			this.done();
			return;
		}
	}
	if (data.privacy === undefined) {
		data.privacy = 1;
	} else if (typeof data.privacy === "number") {
		if (data.privacy === 2) {
			if (true) { // TODO: not Amber
				this.value = {
					error: "Private items require an Amber subscription."
				};
				this.status = 422;
				this.done();
				return;
			}
		} else if (!(data.privacy === 0 || data.privacy === 1)) {
			this.value = {
				error: "The `privacy` value must be 0 (public), 1 (unlisted), or 2 (private)."
			};
			this.status = 400;
			this.done();
			return;
		}
	} else {
		this.value = {
			error: "The `privacy` value must be a number."
		};
		this.status = 400;
		this.done();
		return;
	}
	if (typeDir) {
		this.update.$push = {
			pipe: this.value = {
				id: String(ObjectID()),
				date: Date.now(),
				parent: data.parent,
				name: data.name,
				path: parent ? `${parent.path}/${data.name}` : data.name,
				type: "/",
				privacy: data.privacy
			}
		};
		this.value = {
			...this.value,
			size: 0
		}
		this.done();
	} else {
		if (this.req.get("Content-Type") !== "application/octet-stream") {
			this.value = {
				error: 'The `Content-Type` header must be "application/octet-stream" unless the item is a directory.'
			};
			this.status = 400;
			this.done();
			return;
		}
		let body;
		let type = data.type || mime.getType(data.name) || "application/octet-stream";
		if (data.url) {
			try {
				const response = await request.get(data.url, {
					headers: {
						"User-Agent": "Miroware"
					},
					encoding: null,
					resolveWithFullResponse: true
				});
				body = response.body;
				if (body.length > 100 * 1024 * 1024) { // 100 MiB
					this.value = {
						error: "Files larger than 100 MiB are currently not supported due to technical limitations. Sorry!"
					};
					this.status = 422;
					this.done();
					return;
				}
				let contentType = response.headers["content-type"];
				if (contentType) {
					const semicolonIndex = contentType.indexOf(";");
					if (semicolonIndex !== -1) {
						contentType = contentType.slice(0, semicolonIndex);
					}
					if (contentType.length <= 255 && mimeTest.test(contentType)) {
						type = contentType.toLowerCase();
					}
				}
			} catch (err) {
				this.value = {
					error: err.message
				};
				this.status = 422;
				this.done();
				return;
			}
		} else {
			body = this.req.body;
		}
		const id = String(ObjectID());
		s3.putObject({
			Bucket: "miroware-pipe",
			Key: id,
			ContentLength: body.length,
			Body: body,
			Metadata: {
				user: String(user._id)
			}
		}, err => {
			if (err) {
				this.value = {
					error: err.message
				};
				this.status = err.statusCode || 422;
			} else {
				this.update.$push = {
					pipe: this.value = {
						id,
						date: Date.now(),
						parent: data.parent,
						name: data.name,
						path: parent ? `${parent.path}/${data.name}` : data.name,
						type: type,
						size: body.length,
						privacy: data.privacy
					}
				};
			}
			purgePipeCache(user, [this.value]);
			this.done();
		});
	}
} else {
	this.value = {
		error: "You do not have permission to access that user's pipe."
	};
	this.status = 403;
	this.done();
}
