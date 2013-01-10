var lclNumTimes;
var lclIsPB;

var CustomRandom = function(nseed) {    
  
  var seed,    
    constant = Math.pow(2, 13)+1,    
    prime = 1933,    
//any prime number, needed for calculations, 1987 is my favorite:)  
    maximum = 1000;    
//maximum number needed for calculation the float precision of the numbers (10^n where n is number of digits after dot)  
    if (nseed) {    
      seed = nseed;    
    }    
    
    if (seed == null) {    
//before you will correct me in this comparison, read Andrea Giammarchi's text about coercion http://goo.gl/N4jCB  
      
      seed = (new Date()).getTime();   
//if there is no seed, use timestamp     
    }     
    
    return {    
      next : function(min, max) {    
      	while (seed > constant) seed = seed/prime; 
        seed *= constant;    
        seed += prime;    
           
      
        return min && max ? min+seed%maximum/maximum*(max-min) : seed%maximum/maximum;  
// if 'min' and 'max' are not provided, return random number between 0 & 1  
      }    
    }    
}  

//Initialization
function initDB()
{
	window.openDatabase;
	
	try {
		var dbSize = 5000000;
		drawDatabase = openDatabase('drawDatabase','1.0','Draw Information',dbSize);
		
		//check for data. If no data, initialize the database
		drawDatabase.readTransaction(function(tx){
			tx.executeSql('SELECT * FROM zenData',[],nullHandler,initDrawDatabase);
		});

	}
	catch (err) {
		//Ooops, error
		drawDatabase = null;
		alert('Error opening database: ' + err.code + ' - ' + err.message);
		return;
	}	
}

function initDrawDatabase()
{
	drawDatabase.transaction(function(tx){
		//create the table to hold the draws
		tx.executeSql('CREATE TABLE IF NOT EXISTS zenData(itemID INTEGER NOT NULL PRIMARY KEY, title TEXT, isPB INTEGER, seed FLOAT, numDraws INTEGER, saveDate DATETIME)',[],nullHandler,onDbError);		
	});
}

//standard db Error
function onDbError(tx, err){
	alert('Database error occurred: ' + err.code + ' - ' + err.message);
}

//null handler
function nullHandler(tx, r){
	return;
}

//Menu functions
function loadPage(pageID)
{
	switch (pageID)
	{
		case 0:
			bb.pushScreen('draw.html','draw');
			break;
		case 1:
			bb.pushScreen('favs.html','favs');
			break;
		case 2:
			bb.pushScreen('addfav.html','addfav');
			break;
		case 3:
			bb.pushScreen('settings.html','settings');
			break;
		default:
			gblDrawID = 0 - pageID;
			bb.pushScreen('drawDetail.html','drawDetail');
			break;
	}
	
}

function updateNumDrawLabel ()
{
	//set draw label and slider to default
	var numLabel = document.getElementById('numDraw');
	var numSlider = document.getElementById('rngNumDraw');
	
	if(numLabel && numSlider)
	{
		gblNumDraws = parseInt(numSlider.value);
		numLabel.innerHTML = numSlider.value;
	}
}

function initNumDrawLabel()
{
	var numSlider = document.getElementById('rngNumDraw');
	
	if(gblNumDraws)
	{
		numSlider.value = parseInt(gblNumDraws);
	}
	else
	{
		numSlider.value = 5;
	}
	updateNumDrawLabel();
}
function getRandomNumber(max, seed)
{
	//pull the seed from the geolocation
	//If no geolocation, take the time
	
	var newNum = Math.floor((Math.random()*max) +1);
	return parseInt(newNum);
}

function generateSeed(params)
{
	try
	{
		//First test to verify that the browser supports the Geolocation API
		if (navigator.geolocation !== null)
		{
			//Configure optional parameters
			var options;
			if (params)
			{
				options = eval("options = " + params + ";");
			} 
			else {
				// Uncomment the following line to retrieve the most accurate coordinates available
				options = { enableHighAccuracy : true, timeout : 600, maximumAge : 6000 };
			}
			navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError, options);
		} 
		else {
			//no geolocation
			geolocationError();
		}
	} 
	catch (e) {
		errorMessage("exception (getPosition): " + e);
	}
}

function geolocationSuccess(position)
{
	try
	{
		// The Position object contains the following parameters:
		//	coords - geographic information such as location coordinates, 
		//           accuracy, and optional attributes (altitude and speed).
		var coordinates = position.coords;
		var seed = coordinates.latitude + coordinates.longitude + coordinates.altitude;		
		buildDraw(lclNumTimes,lclIsPB,seed);
	} 
	catch (e) {
		geolocationError();
	}
	
}

function geolocationError(error)
{
	alert('Error: ' + error.message);
	//no geolocation, use the time in miliseconds
	var d = new Date();
	var seed = d.getMilliseconds();
	buildDraw(lclNumTimes,lclIsPB,seed);
}

function buildDraw(numTimes, isPB, seed)
{
	var output = new Array(parseInt(numTimes));
	var rndNumber = CustomRandom(seed);
	
	var i=0;
	for(i=0; i<numTimes; i++)
	{
		output[i] = makeNumbers(isPB,rndNumber);
	}
	
	//return output;
	buildResults(output, isPB);	
}

function makeNumbers(isPB,randSeq)
{
	var numbers = new Array(6);
	var numberDrawn, i=0, maxNormal, maxSpecial;
	
	if(isPB == 1)
	{
		maxNormal = 59;
		maxSpecial = 35;
	}
	else
	{
		maxNormal = 56;
		maxSpecial = 46;
	}
	
	for(i=0; i<5; i++)
	{
		numberDrawn = parseInt(randSeq.next(1,maxNormal));
		
		//before you add, make sure it is unique
		var r=0;
		for(r=0;r<i; r++)
		{
			if(numberDrawn == numbers[r])
			{
				numberDrawn = parseInt(randSeq.next(1,maxNormal));
				r = 0;
			}
		}
		numbers[i] = numberDrawn;
	}
	
	//sort the numbers
	numbers.sort(function(a,b){return a - b});
	
	//make the special number
	numberDrawn = parseInt(randSeq.next(1,maxSpecial));
	numbers[5] = numberDrawn;
	
	return numbers;
}

function doTheWork(numTimes, isPB)
{
	//This is the main function
	lclNumTimes = numTimes;
	lclIsPB = isPB;
	generateSeed();
}

function buildResults(numberArray, isPB)
{
	var numberTable = document.getElementById('numberDiv');
	var i=0;
	
	//clear the node
	while (numberTable.hasChildNodes()) { 
    	numberTable.removeChild(numberTable.lastChild); 
    } 

	for(i=0;i<numberArray.length;i++)
	{
		var tempDiv = document.createElement('div');
		tempDiv.style.clear = "both";
		
		var setHighlight = i%2;

		for (k=0; k<numberArray[i].length; k++)
		{
			if(k==5)
			{
				tempDiv.appendChild(createBall(isPB + 1, numberArray[i][k], setHighlight));
			}
			else
			{
				tempDiv.appendChild(createBall(0, numberArray[i][k], setHighlight));
			}
		}

		numberTable.appendChild(tempDiv);

	}
	
	//since we changed the inner panel, refresh the scroll panel so it works correctly
	document.getElementById('scrollPanel').refresh();
}

function createBall(specialType, numberToWrite, highlight)
{

	var tempDiv = document.createElement('div');
	switch (specialType)
	{
		case 1:
			tempDiv.style.background = "url('images/goldBall2.png')";
			break;
		case 2:
			tempDiv.style.background = "url('images/redBall2.png')";
			break;
		default:
			tempDiv.style.background = "url('images/whiteBall2.png')";
			break;
	}
	
	tempDiv.style.backgroundRepeat = "no-repeat";
	tempDiv.style.width = "100px";
	tempDiv.style.height = "65px";
	tempDiv.style.textAlign ="center";
	tempDiv.style.paddingTop = "40px";
	tempDiv.innerHTML = numberToWrite;
	if(highlight == 0)
	{
		tempDiv.style.backgroundColor = "#CCCCCC";
	}
	tempDiv.style.float = "left";
	return tempDiv;
}

function createText(dNumber, hOffSet, vOffSet)
{
	var tempText = document.createElement('div');
	tempText.style.position = "absolute";
	tempText.style.top = "40px";
	tempText.style.left = "40px";
	tempText.innerHTML = dNumber;
	
	return tempText;

}


// Debug functions
function showArray(theArray){
        var quote = "";
        for (var i = 0; i < theArray.length; i++){
            quote += theArray[i] + " ";
        }
        return quote;    
   }
   
function displayRandomNumber(max)
{
	var debugLabel = document.getElementById('debug');
	if(debugLabel)
	{
		debugLabel.innerHTML = getRandomNumber(max);
	}
}

function displayString(inString)
{
	var debugLabel = document.getElementById('debug');
	debugLabel.innerHTML = inString;
}

function setScrollHeight()
{
	var ele = document.getElementById('scrollPanel');
	var divHeight = "400px";
	if (ele) {
		var scrollNewHeight = screen.height 
			- document.getElementById("divTitle").offsetHeight 
			- document.getElementById("divButtons").offsetHeight
			- document.getElementById("divActionBar").offsetHeight;		
		if(document.getElementById("numPicks"))
		{
			scrollNewHeight = scrollNewHeight - document.getElementById("numPicks").offsetHeight;
		}			
		if(document.getElementById("divDelete"))
		{
			scrollNewHeight = scrollNewHeight - document.getElementById("divDelete").offsetHeight;
			scrollNewHeight = scrollNewHeight - document.getElementById("divSaveName").offsetHeight;
			//hack until fix for divtitle height returning 0
			scrollNewHeight = scrollNewHeight - 150;
		}			
		ele.style.height = scrollNewHeight - 50 + "px";
		console.log("scrollNewHeight: " + scrollNewHeight);
		console.log("divActionBar.style.height: " + document.getElementById("divActionBar").offsetHeight);
		//alert("New Height: " + ele.style.height);
	}
}

function buildActionBar(element, pageID)
{	//set variable for action-bar tabs
	var abMain, abTab;

	//get the action-bar container
	var ele = element.getElementById('favs');
	
	abMain = document.createElement('div');
	abMain.setAttribute('data-bb-type', 'action-bar');
	abMain.setAttribute('data-bb-tab-style', 'highlight')
	
	console.log('PageID: ' + pageID);
	console.log('We have element');
	console.log(element.toString());
	
	if(ele)
	{
		console.log('Element: ' + element.id);
		
		//If we have the container, build the action bar
		abTab = document.createElement('div');
		abTab.setAttribute('data-bb-type', 'action');
		abTab.setAttribute('data-bb-img', 'images/LottoBall.png')
		abTab.setAttribute('onclick', 'loadPage(0);');
		abTab.innerHTML = 'Draw Numbers';
		
		//add this div to the action-bar
		abMain.appendChild(abTab);
		
		//If we have the container, build the action bar
		abTab = document.createElement('div');
		abTab.setAttribute('data-bb-type', 'action');
		abTab.setAttribute('data-bb-img', 'images/Favorite.png')
		abTab.setAttribute('onclick', 'loadPage(1);');
		abTab.innerHTML = 'Favorites';
		
		//add this div to the action-bar
		abMain.appendChild(abTab);

		//If we have the container, build the action bar
		abTab = document.createElement('div');
		abTab.setAttribute('data-bb-type', 'action');
		abTab.setAttribute('data-bb-img', 'images/MapMarker.png')
		abTab.setAttribute('onclick', 'loadPage(2);');
		abTab.innerHTML = 'Add Favorites';
		
		//add this div to the action-bar
		abMain.appendChild(abTab);

		//If we have the container, build the action bar
		abTab = document.createElement('div');
		abTab.setAttribute('data-bb-type', 'action');
		abTab.setAttribute('data-bb-img', 'images/Settings.png')
		abTab.setAttribute('onclick', 'loadPage(3);');
		abTab.innerHTML = 'Settings';
		
		//add this div to the action-bar
		abMain.appendChild(abTab);	
		
		ele.appendChild(abMain);
		console.log('InnerHTML: ' + element.innerHTML);					
	}
	
}
