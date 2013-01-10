//Get the data from the database, then call doTheWork from core

var peekX = peekY = endX = 0;

function initDD() {
	//make sure you get the data
	drawDatabase.readTransaction(function(tx) {
		tx.executeSql('SELECT * FROM zenData WHERE itemID=?', [gblDrawID], loadDraw, onDbError);
	});

	initFavs();
}

function loadDraw(tx, rs) {
	doTheWork(rs.rows.item(0).numDraws, rs.rows.item(0).isPB, rs.rows.item(0).seed);

	if (rs.rows.item(0).isPB == 1) {
		var elePill = document.getElementById('pbPill');
	} else {
		var elePill = document.getElementById('mmPill');
	}

	elePill.click();

	var divTitle = document.getElementById('divSaveName');
	divTitle.innerHTML = rs.rows.item(0).title;
}

function deleteFav() {
	try {
		var buttons = ["Yes", "No"];
		var ops = {
			title : "Delete Favorite",
			size : blackberry.ui.dialog.SIZE_SMALL,
			position : blackberry.ui.dialog.CENTER
		};
		blackberry.ui.dialog.customAskAsync("Are you sure you want to delete this favorite?", buttons, removeFavFromDB, ops);
	} catch(e) {
		alert("Exception in customDialog: " + e);
	}
}

function removeFavFromDB(index) {
	//delete the current favorite
	if (index == 0) {
		drawDatabase.transaction(function(tx) {
			tx.executeSql('DELETE FROM zenData WHERE itemID=?', [gblDrawID], loadPage(1), onDbError);
		});
	}
}

function initTouch() {
	document.addEventListener("touchstart", doTouchStart, false);
	document.addEventListener("touchmove", doTouchMove, false);
	document.addEventListener("touchend", doTouchEnd, false);
	document.addEventListener("touchcancel", doTouchCancel, false);
}

function doTouchStart(event) {
	event.preventDefault();

	var touchEvent, x, y;

	touchEvent = event.changedTouches[0];
	peekX = touchEvent.pageX;
	peekY = touchEvent.pageY;

}

function doTouchMove(event) {
	event.preventDefault();

	var ele = document.getElementById('detailPage');

	var touchEvent, x, y;

	touchEvent = event.changedTouches[0];
	x = touchEvent.pageX;
	y = touchEvent.pageY;
	var adjustedX = parseInt(x) - parseInt(peekX);
	if (ele && Math.abs(adjustedX>50)) {
		ele.style.webkitTransition = "all 0.0s ease-in-out";
		//Do this so there is no movement to the left
		if (adjustedX < 0)
			adjustedX = 0;
		ele.style.webkitTransform = "translate(" + adjustedX + "px, 0)";
		endX = adjustedX;
		console.log("touchmove x: " + parseInt(x) + " peekX: " + parseInt(peekX) + " difference: " + adjustedX);
	}
}

function doTouchEnd(event) {
	event.preventDefault();

	//If the event ended more than half the screen, pop the stack
	if (endX > 400) {
		bb.popScreen();
	} else {

		var ele = document.getElementById('detailPage');

		var touchEvent, x, y;

		touchEvent = event.changedTouches[0];
		x = touchEvent.pageX;
		y = touchEvent.pageY;

		if (ele) {
			ele.style.webkitTransition = "all 0.0s ease-in-out";
			ele.style.webkitTransform = "translate(0px, 0)";
			console.log("touchend x: " + x + " starty: " + y);
		}
	}

}

function doTouchCancel(event) {
	event.preventDefault();

	var ele = document.getElementById('tempLabel');

	if (ele) {
		ele.innerHTML = "touchcancel";
	}
}