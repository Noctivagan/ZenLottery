//This is the Favs page javascript
//build the arrow lists

function initFavs(element) {
	//make sure you get the data
	drawDatabase.readTransaction(function(tx) {
		tx.executeSql('SELECT * FROM zenData WHERE isPB=1 ORDER BY itemID ASC', [], loadPBArrow, onDbError);
	});

	//load the mega millions. Since the two are in separate divs they can be loaded in sequence
	drawDatabase.readTransaction(function(tx) {
		tx.executeSql('SELECT * FROM zenData WHERE isPB=0 ORDER BY itemID ASC',[],loadMMArrow,onDbError);
	});

}

function loadPBArrow(tx, rs) {
	var ele = document.getElementById('pbArrow');
	var newDiv, container;
	
	//loop through record set
	for (var i = 0; i < rs.rows.length; i++) {
		// Create a dummy container
		//container = document.createElement('div');
		row = rs.rows.item(i);
		newDiv = document.createElement('div');
		newDiv.setAttribute('data-bb-type', 'item');
		newDiv.setAttribute('data-bb-img', 'images/redBall2.png')
		newDiv.innerHTML = row.title;
		//use the setAttribute since you need row.itemID to be recorded and not accessed as a reference
		newDiv.setAttribute('onclick', 'loadPage(-' + row.itemID + ')');
		
		//container.appendChild(newDiv);
		//bb.imageList.apply([container])
		ele.appendItem(newDiv);
	}

}

function loadMMArrow(tx, rs) {
	var ele = document.getElementById('mmArrow');
	var newDiv, container;

	//loop through record set

	for (var i = 0; i < rs.rows.length; i++) {
		container = document.createElement('div');
		row = rs.rows.item(i);
		newDiv = document.createElement('div');
		newDiv.setAttribute('data-bb-type', 'item');
		newDiv.setAttribute('data-bb-img', 'images/goldBall2.png')
		newDiv.innerHTML = row.title;
		newDiv.setAttribute('onclick', 'loadPage(-' + row.itemID + ')');
		container.appendChild(newDiv);
		container.appendChild(newDiv);
		bb.imageList.apply([container])
		ele.appendChild(container.firstChild);
	}

}
