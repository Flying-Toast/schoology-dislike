let loadedCheckInterval = setInterval(function() {
	if (document.readyState == "complete") {
		clearInterval(loadedCheckInterval);
		main();
	}
}, 500);

function main() {
	loadCustomStyle();

	domUpdateTick();
	setInterval(domUpdateTick, 1000);
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

function domUpdateTick() {
	Array.from(document.querySelectorAll(".like-btn")).forEach(function(i) {
		if (i.parentElement.querySelector(".dislike-btn") == null) {
			addDislikeButton(i);
		}
	});
}

function addDislikeButton(likeButtonElement) {
	let likeContent = likeButtonElement.querySelector(".content");
	likeContent.innerText = likeContent.innerText.trimEnd();

	const postID = likeButtonElement.id.split("-").pop();

	let dislikeButton = document.createElement("span");
	dislikeButton.id = `dislike-id-${postID}`;
	dislikeButton.className = "dislike-btn";
	dislikeButton.style.fontWeight = "normal";
	dislikeButton.style.cursor = "pointer";
	dislikeButton.style.color = "#4479B3";
	dislikeButton.addEventListener("click", dislikeClickHandler);

	let buttonContent = document.createElement("span");
	buttonContent.id = `dislike-content-id-${postID}`;
	buttonContent.className = "content";
	buttonContent.innerText = "Dislike";
	dislikeButton.appendChild(buttonContent);

	likeButtonElement.parentNode.insertBefore(dislikeButton, likeButtonElement.nextSibling);
	likeButtonElement.after(" · ");
}

function dislikeClickHandler(e) {
	const postID = e.target.id.split("-").pop();
}

// TODO
// will query the backend, for now just returns placeholder data
function fetchDislikes(postID) {
	return [
		{
			username: "Nicole Weng",
			userID: 10790849
		},
		{
			username: "Isabella Shaw",
			userID: 10781739
		}
	];
}

function profileImageURL(userID) {
	return `https://asset-cdn.schoology.com/users/${userID}/profile-image/profile_sm`;
}
