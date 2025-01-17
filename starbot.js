"use strict";
console.log("< Starbot >");
const fs = require("fs");
const { Client } = require("discord.js");
const prefix = /^!star */i;
const spaces = / +/g;
const underscores = /_/g;
const channelTest = /^<#(\d+)>$/;
const colorTest = /^#?(?:([\da-f])([\da-f])([\da-f])|([\da-f]{6}))$/i;
const messageLinkTest = /^https:\/\/discord(?:app)?\.com\/channels\/(\w+)\/(\w+)\/(\w+)$/;
const doNothing = () => { };
const italicize = str => `_${JSON.stringify(String(str)).slice(1, -1).replace(underscores, "\\_")}_`;
const byTextChannels = channel => channel.type === "GUILD_TEXT";
let data;
const load = () => {
	data = JSON.parse(fs.readFileSync("secret/starbot.json"));
};
load();
const save = () => {
	fs.writeFileSync("secret/starbot.json", JSON.stringify(data));
};
const client = new Client({
	intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS']
});
const exitOnError = err => {
	console.error(err);
	process.exit(1);
};
process.once("unhandledRejection", exitOnError);
client.once("error", exitOnError);
client.once("disconnect", exitOnError);
const inform = (guild, string1, string2) => {
	if (guild.available) {
		guild.members.resolve(guild.ownerId).send(string1).catch(() => {
			const channels = guild.channels.cache.filter(byTextChannels);
			let i = -1;
			const testChannel = () => {
				i++;
				if (channels[i]) {
					channels[i].send(string2).catch(testChannel);
				}
			};
			testChannel();
		});
	}
};
const broadcast = string => {
	const sentRecipients = [];
	for (const [, guild] of client.guilds.cache) {
		if (guild.available && !sentRecipients.includes(guild.ownerId)) {
			inform(guild, string, `<@${guild.ownerId}> ${string}`);
			sentRecipients.push(guild.ownerId);
		}
	}
};
const permWarn = (guild, perms) => {
	const warning = `, likely because I do not have permission to ${perms}. It is recommended that you enable these permissions for me in attempt to resolve this error.`;
	inform(guild, `An error occured in ${italicize(guild.name) + warning}`, `<@${guild.ownerId}> An error occured${warning}`);
};
const noStarboard = guild => {
	const warning = ', as there is nowhere for starred messages to be placed. No starboard channel has been set!\nWith admin permissions, you can set the starboard channel by entering `!star <channel tag>`. It is recommended that you also set permissions on that channel channel so only I can send messages in it.';
	inform(guild, `An error occured in ${italicize(guild.name) + warning}`, `<@${guild.ownerId}> An error occured${warning}`);
}
const guildCreate = guild => {
	console.log(`guildCreate ${guild}`);
	data.guilds[guild] = [null, "%E2%AD%90", 5, 16755763];
	noStarboard(client.guilds.resolve(guild));
};
const errSendMessages = msg => () => {
	permWarn(msg.guild, `send messages, in the ${msg.channel} channel or otherwise`);
};
const errEmbedLinks = msg => () => {
	permWarn(msg.guild, `send messages or embed links, in the ${msg.channel} channel or otherwise`);
};
const errManageMessages = msg => () => {
	permWarn(msg.guild, `manage messages, in the ${msg.channel} channel or otherwise`);
};
const sendHelp = (msg, perm) => {
	const noGuild = !msg.guild;
	if (noGuild || data.guilds[msg.guild.id][0]) {
		let help = noGuild ? "" : `${msg.author} You can add ${data.guilds[msg.guild.id][2]} ${decodeURI(data.guilds[msg.guild.id][1])} ${data.guilds[msg.guild.id][2] === 1 ? "reaction" : "reactions"} to a message on this server to add it to the <#${data.guilds[msg.guild.id][0]}> channel.`;
		if (perm || noGuild) {
			help += `${noGuild ? "" : "\n"}With admin permissions, you can use the following commands.\n\n\`!star <channel tag>\`\nSet the starboard channel.\n\n\`!star <number>\`\nDefine how many reactions should get messages starred.\n\n\`!star <emoji, not custom>\`\nDefine which emoji should be used to star messages.\n\n\`!star <hex color code>\`\nChange the starred embed color.\n\n\`!star <message link> [target channel tag]\`\nStar a message manually. If no target channel is specified, it will default to the starboard if one is set.\n\n\`!star selfstar\`\nToggle whether users can star their own messages. Self-starring is allowed by default.\n\n\`!star erase\`\nKick me from the server after erasing all my data associated with your server. (The starboard channel will remain unaffected.)\n\nYou can also prevent me from scanning messages and accepting commands in a certain channel by adding me to its channel permissions and disabling my permission to read messages.`;
		}
		help += "\n\nTo report any issues, message the bot owner @Grant#2604.\nTo invite me to one of your own Discord servers, go to <https://miroware.io/discord/starbot/>.";
		msg.channel.send(help).catch(errSendMessages(msg));
	} else {
		noStarboard(msg.guild);
	}
};
const present = () => {
	client.user.setPresence({
		status: "online",
		activity: {
			type: "WATCHING",
			name: 'for "!star"'
		}
	});
};
client.once("ready", () => {
	for (const [id, guild] of client.guilds.cache) {
		if (data.guilds[id]) {
			if (data.guilds[id][0] && !guild.channels.resolve(data.guilds[id][0])) {
				data.guilds[id][0] = null;
			}
		} else {
			guildCreate(id);
		}
	}
	save();
	setInterval(present, 60000);
	present();
});
client.on("guildCreate", guild => {
	if (!data.guilds[guild.id]) {
		guildCreate(guild.id);
		save();
	}
});
client.on("channelDelete", channel => {
	if (channel.id === data.guilds[channel.guild.id][0]) {
		data.guilds[channel.guild.id][0] = null;
		save();
	}
});
const starred = [];
const star = (msg, callback, channel) => {
	channel = channel || data.guilds[msg.guild.id][0];
	if (channel) {
		console.log(`star ${msg.guild.id} ${msg.channel.id} ${msg.id}`);
		if (!starred.includes(msg.id)) {
			starred.push(msg.id);
		}
		const embed = {
			embeds: [{
				timestamp: msg.createdAt.toISOString(),
				color: data.guilds[msg.guild.id][3],
				fields: [{
					name: "Author",
					value: String(msg.author),
					inline: true
				}, {
					name: "Source",
					value: `${msg.channel}/[context](https://discord.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id})`,
					inline: true
				}, {
					name: "Message",
					value: msg.content || "..."
				}]
			}]
		};
		if (embed.embeds[0].fields[2].value.length > 1024) {
			embed.embeds[0].fields[2].value = msg.content.slice(0, 1024);
			embed.embeds[0].fields.push({
				name: "Continued",
				value: msg.content.slice(1024)
			});
		}
		const attachment = msg.attachments.first();
		if (attachment) {
			embed.embeds[0].image = {
				url: attachment.url
			};
		}
		const starboard = msg.guild.channels.resolve(channel);
		starboard.send(embed).then(callback).catch(() => {
			permWarn(msg.guild, `send messages, ${attachment ? "and/or embed links" : "embed links, and/or attach files"}, in the ${starboard} channel or otherwise`);
		});
	} else {
		noStarboard(msg.guild);
	}
};
client.on("messageReactionAdd", async reaction => {
	if (!starred.includes(reaction.message.id) && data.guilds[reaction.message.guild.id] && reaction.message.author && reaction.message.author !== client.user && reaction.emoji.identifier === data.guilds[reaction.message.guild.id][1]) {
		let { count } = reaction;
		if (data.guilds[reaction.message.guild.id][4] && reaction.users.resolve(reaction.message.author.id)) {
			count--;
			reaction.message.author.send(`Trying to star your own message? That star doesn't count on ${italicize(reaction.message.guild.name)}.`).catch(doNothing);
			reaction.users.remove(reaction.message.author).catch(errManageMessages(reaction.message));
		}
		if (count >= data.guilds[reaction.message.guild.id][2]) {
			star(reaction.message);
		}
	}
});
client.on("messageCreate", async msg => {
	if (msg.system) {
		return;
	}
	if (msg.channel.type === "GUILD_TEXT") {
		let content = msg.content;
		if (prefix.test(content)) {
			const member = msg.guild.members.resolve(msg.author) || await msg.guild.members.fetch(msg.author);
			const perm = member.permissions.has('ADMINISTRATOR') || member.id === "152282430915608578";
			if (perm) {
				content = content.replace(prefix, ""); // TODO: Don't let no space after "!star" be valid
				if (content) {
					content = content.replace(spaces, " ");
					if (content === "selfstar") {
						if (data.guilds[msg.guild.id][4]) {
							data.guilds[msg.guild.id].splice(4, 1);
							msg.channel.send(`${msg.author} Self-starring is now allowed.`).catch(errSendMessages(msg));
						} else {
							data.guilds[msg.guild.id][4] = 1;
							msg.channel.send(`${msg.author} Self-starring is now disallowed.`).catch(errSendMessages(msg));
						}
						save();
					} else if (content === "erase") {
						msg.channel.send(`${msg.author} Are you sure you want to kick me from the server after erasing all my data associated with your server? This cannot be undone. (The starboard channel will remain unaffected.) Enter \`!star erase confirm\` to confirm.`).catch(errSendMessages(msg));
					} else if (content === "erase confirm") {
						delete data.guilds[msg.guild.id];
						save();
						msg.guild.leave();
					} else {
						const old1 = data.guilds[msg.guild.id][1];
						data.guilds[msg.guild.id][1] = null;
						msg.react(content).then(reaction => {
							reaction.users.remove(client.user).then(() => {
								data.guilds[msg.guild.id][1] = reaction.emoji.identifier;
								save();
								msg.channel.send(`${msg.author} Members now have to react with the ${content} emoji to get a message starred.`).catch(errSendMessages(msg));
							});
						}).catch(err => {
							data.guilds[msg.guild.id][1] = old1;
							save();
							const noLinkedMessage = () => {
								if (channelTest.test(content)) {
									const starboard = content.replace(channelTest, "$1");
									if (msg.guild.channels.resolve(starboard)) {
										data.guilds[msg.guild.id][0] = starboard;
										save();
										msg.channel.send(`${msg.author} The starboard channel has been starred to ${content}.`).catch(errSendMessages(msg));
									} else {
										msg.channel.send(`${msg.author} That channel does not exist, or I do not have permission to read messages in it.`).catch(errSendMessages(msg));
									}
								} else {
									const reactionCount = parseInt(content);
									if (reactionCount) {
										data.guilds[msg.guild.id][2] = Math.abs(reactionCount);
										save();
										msg.channel.send(`${msg.author} Members now have to add ${data.guilds[msg.guild.id][2]} ${data.guilds[msg.guild.id][2] === 1 ? "reaction" : "reactions"} to get a message starred.`).catch(errSendMessages(msg));
									} else if (colorTest.test(content)) {
										const code = content.replace(colorTest, "$1$1$2$2$3$3$4");
										data.guilds[msg.guild.id][3] = parseInt(code, 16);
										save();
										msg.channel.send({
											content: `The starred embed color has been changed to \`#${code}\`.\n(The default starred embed color is \`#ffac33\`.)`,
											embeds: [{
												title: `#${code}`,
												color: data.guilds[msg.guild.id][3]
											}]
										}).catch(errEmbedLinks(msg));
									} else {
										sendHelp(msg, perm);
									}
								}
							};
							const contentArray = content.split(" ");
							const messageLinkMatch = contentArray[0] && contentArray[0].match(messageLinkTest);
							const linkedChannel = messageLinkMatch && msg.guild.channels.resolve(messageLinkMatch[2]);
							const fetchMessage = linkedChannel && linkedChannel.messages.fetch(messageLinkMatch[3]);
							if (fetchMessage) {
								fetchMessage.then(msg2 => {
									star(msg2, result => {
										msg.channel.send(`${msg.author} The linked message has been sent to ${result.channel}.`).catch(errSendMessages(msg));
									}, contentArray[1] && channelTest.test(contentArray[1]) ? contentArray[1].replace(channelTest, "$1") : undefined);
								}).catch(noLinkedMessage);
							} else {
								noLinkedMessage();
							}
						});
					}
				} else {
					sendHelp(msg, perm);
				}
			} else {
				sendHelp(msg, perm);
			}
		}
	} else if (prefix.test(msg.content)) {
		sendHelp(msg, true);
	}
});
client.login(data.token);
fs.watch(__filename, () => {
	process.exit();
});
require("replthis")(v => eval(v));
