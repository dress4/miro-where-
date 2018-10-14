if(notLoggedIn(this)) {
	return;
}
this.title = "Pipe";
this.image = "/pipe/images/icon/full.png";
this.icon = "/pipe/images/icon/cover.png";
this.value = (await load("load/head", this)).value;
this.value += html`
		<link rel="stylesheet" href="style.css">`;
this.value += (await load("load/body", this)).value;
this.value += (await load("load/pagehead", this)).value;
this.value += html`
				<p>Miroware Pipe is in the pre-alpha stage. Do not expect things to work, and upload files with intent to test rather than host. All files uploaded during this stage will eventually be deleted.</p>
				<table id="table">
					<thead>
						<th id="nameHead">Name</th>
						<th id="sizeHead">Size</th>
						<th id="dateHead">Date</th>
					</thead>
					<tbody id="files">`;
for(const item of ) {
	this.html += html`
						<tr class="file">
							<td class="nameData" title="$${item.name}">$${item.name}</td>
							<td class="sizeData" title="${item.size}">${getSize(item.size)}</td>
							<td class="dateData">${getDate(item.date)}</td>
						</tr>`;
}
this.value += html`
					</tbody>
				</table>`;
this.value += (await load("load/pagefoot", this)).value;
this.value += html`
			<button id="uploadButton" class="mdc-fab mdc-ripple" title="Add file(s)">
				<i class="mdc-fab__icon material-icons">add</i>
			</button>`;
this.value += (await load("load/belt", this)).value;
this.value += html`
		<div id="targetIndicator"></div>
		<script src="script.js"></script>`;
this.value += (await load("load/foot", this)).value;
this.done();
