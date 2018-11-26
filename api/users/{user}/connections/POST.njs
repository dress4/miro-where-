const {user, isMe} = await parseUser(this);
if(isMe) {
	if(this.now - this.token.super < 300000) {
		connect(this).then(data => {
			if(this.user.connections.some(connection => connection.service === data.connection[0] && connection.id === data.id)) {
				this.value = {
					error: "Those credentials are already connected to your account."
				};
				this.status = 422;
			} else {
				this.value = {};
				const connection = {
					service: data.connection[0],
					id: data.id
				};
				if(data.connection[0] === "password") {
					connection.hash = youKnow.crypto.hash(data.connection[1], user.salt.buffer);
				}
				this.update.$push = {
					connections: connection
				};
				this.value = sanitizeConnection(connection);
			}
			this.done();
		});
	} else {
		this.value = {
			error: "Your token is not in super mode."
		};
		this.status = 401;
		this.done();
	}
} else {
	this.value = {
		error: "You do not have permission to access that user's connections."
	};
	this.status = 403;
	this.done();
}
