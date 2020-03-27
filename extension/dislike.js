let loadedCheckInterval = setInterval(function() {
	if (document.readyState == "complete") {
		clearInterval(loadedCheckInterval);
		main();
	}
}, 500);

let _dislikeCache = new Map();
function cacheDislikes(postID) {
	if (_dislikeCache.has(postID)) {
		return;
	}

	_dislikeCache.set(postID,
		// TODO
		// will query the backend, for now just returns placeholder data
		[{
			name: "Nicole Weng",
			userID: 10790849
		},{
			name: "Isabella Shaw",
			userID: 10781739
		},{
			name: "Simon Schwartz",
			userID: 10785041
		}]
	);
}

function getDislikes(postID) {
	cacheDislikes(postID);
	return _dislikeCache.get(postID);
}

let _idOfLoggedInUser = null;
function myID() {
	return _idOfLoggedInUser;
}

function main() {
	let dropdownToggle = document.querySelector(`div[data-sgy-sitenav="header-my-account-menu"]`).children[0];
	dropdownToggle.click();

	_idOfLoggedInUser = document.querySelector(`div[data-sgy-sitenav="header-my-account-menu"]`)
							.children[1].children[0].querySelector(`[role="menuitem"]`).href.split("/")
							.slice(-2)[0];
	dropdownToggle.click();
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
		let dislikeButton = i.parentElement.querySelector(".dislike-btn");
		if (dislikeButton == null) {
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
	const postDislikes = getDislikes(postID);

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
	if (postDislikes.some(i => i.userID == myID())) {
		buttonContent.innerText = "Un-dislike";
	} else {
		buttonContent.innerText = "Dislike";
	}
	dislikeButton.appendChild(buttonContent);

	let icon = makeDislikeIcon();

	likeButtonElement.parentNode.insertBefore(dislikeButton, likeButtonElement.nextSibling);
	likeButtonElement.after(" · ");
	if (isComment(postID)) {
		let divider = document.createElement("span");
		divider.innerText = " · ";
		divider.style.color = "#677583";

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
			dislikeButton.parentNode.insertBefore(divider, dislikeButton.nextSibling);
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
