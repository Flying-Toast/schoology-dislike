let loadedCheckInterval = setInterval(function() {
	if (document.readyState == "complete") {
		clearInterval(loadedCheckInterval);
		main();
	}
}, 500);

let dislikes = new Map();
function cacheDislikes(postID) {
	if (dislikes.has(postID)) {
		return;
	}

	dislikes.set(postID,
		// TODO
		// will query the backend, for now just returns placeholder data
		[{
			username: "Nicole Weng",
			userID: 10790849
		},{
			username: "Isabella Shaw",
			userID: 10781739
		}]
	);
}

function getDislikes(postID) {
	cacheDislikes(postID);
	return dislikes.get(postID);
}

function main() {
	loadCustomStyle();

	domUpdateTick();
	setInterval(domUpdateTick, 1000);
}

function loadCustomStyle() {
	let el = document.createElement("style");
	document.head.appendChild(el);

	el.sheet.insertRule(`.dislike-btn:hover { text-decoration: underline; }`);
	el.sheet.insertRule(`.dislike-wrapper:hover > .dislike-count { text-decoration: underline; }`);
}

function makeDislikeIcon() {
	let dislikeIcon = document.createElement("img");
	dislikeIcon.src = browser.extension.getURL("dislike-icon.png");
	dislikeIcon.width = 15;
	dislikeIcon.height = 15;
	dislikeIcon.style.verticalAlign = "text-bottom";
	dislikeIcon.style.position = "relative";
	dislikeIcon.style.bottom = "2px";
	return dislikeIcon;
}

function domUpdateTick() {
	Array.from(document.querySelectorAll(".like-btn")).forEach(function(i) {
		if (i.parentElement.querySelector(".dislike-btn") == null) {
			addDislikeButton(i);
		}
	});
}

function isComment(postID) {
	let dislikeButton = document.querySelector(`#dislike-id-${postID}`);
	return dislikeButton.parentNode.className.split("-")[0] == "comment";
}

function addDislikeButton(likeButtonElement) {
	let likeContent = likeButtonElement.querySelector(".content");
	likeContent.innerText = likeContent.innerText.trimEnd();

	const postID = likeButtonElement.id.split("-").pop();
	cacheDislikes(postID);

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

	let icon = makeDislikeIcon();

	likeButtonElement.parentNode.insertBefore(dislikeButton, likeButtonElement.nextSibling);
	likeButtonElement.after(" · ");
	const postDislikes = getDislikes(postID);
	if (isComment(postID)) {
		let divider = document.createElement("span");
		divider.innerText = " · ";
		divider.style.color = "#677583";
		if (likeButtonElement.parentElement.querySelector(".s-like-comment-icon") == null) {
			divider.innerText = " ";
			divider.style.color = "transparent";
		}
		dislikeButton.parentNode.insertBefore(divider, dislikeButton.nextSibling);

		let wrapper = document.createElement("span");
		wrapper.className = "dislike-wrapper";
		wrapper.style.cursor = "pointer";
		let dislikeCount = document.createElement("span");
		dislikeCount.className = "dislike-count";
		dislikeCount.innerText = postDislikes.length;
		dislikeCount.style.marginLeft = "4px";
		dislikeCount.style.color = "#4479B3";
		wrapper.appendChild(icon);
		wrapper.appendChild(dislikeCount);

		if (postDislikes.length != 0) {
			divider.parentNode.insertBefore(wrapper, divider.nextSibling);
		}
	}
}

function dislikeClickHandler(e) {
	const postID = e.target.id.split("-").pop();
	//console.log(getDislikes(postID));
	console.log(isComment(postID));
}

function profileImageURL(userID) {
	return `https://asset-cdn.schoology.com/users/${userID}/profile-image/profile_sm`;
}
