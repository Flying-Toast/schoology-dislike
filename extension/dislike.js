let loadedCheckInterval = setInterval(function() {
	if (document.readyState == "complete") {
		clearInterval(loadedCheckInterval);
		main();
	}
}, 500);

function main() {
	loadCustomStyle();

	Array.from(document.querySelectorAll(".like-btn")).forEach(function(i) {
		const postID = i.id.split("-").pop();

		let dislikeButton = document.createElement("span");
		dislikeButton.className = "dislike-btn";
		dislikeButton.style.fontWeight = "normal";
		dislikeButton.style.cursor = "pointer";
		dislikeButton.style.color = "#4479B3";

		let buttonContent = document.createElement("span");
		buttonContent.className = "content";
		buttonContent.innerText = "Dislike";
		dislikeButton.appendChild(buttonContent);

		i.parentNode.insertBefore(dislikeButton, i.nextSibling);
		i.after(" · ");
	});
}

function loadCustomStyle() {
	let el = document.createElement("style");
	document.head.appendChild(el);

	el.sheet.insertRule(`.dislike-btn:hover { text-decoration: underline; }`);
}

function makeDislikeIcon() {
	let dislikeIcon = document.createElement("img");
	dislikeIcon.src = browser.extension.getURL("dislike-icon.png");
	dislikeIcon.width = 16;
	dislikeIcon.height = 16;
	dislikeIcon.style.verticalAlign = "text-bottom";
	return dislikeIcon;
}
