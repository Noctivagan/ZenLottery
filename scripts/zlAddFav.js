//The database was opened/created at init. Just need to save it out.

var lclIsPB = 1;
var numDraws = 0;
var currentDraws = 0;

function saveDraw()
{
	getNumDraws(lclIsPB);
}

function getNumDraws(isPB)
{
	drawDatabase.readTransaction(function (tx)
	{
		tx.executeSql('SELECT itemID from zenData where isPB=?',[isPB],rtnCount,onDbError);
	});
}

function rtnCount(tx, rs)
{
	currentDraws = rs.rows.length;
	writeDraw();
}

function writeDraw()
{			
	
	var eleName = document.getElementById('txtFavorite');
	var txtName = '';
	
	if(eleName)
	{
		//if there is no name, create one based on the number of draws for this section
		if(eleName.value === '')
		{	
			var temp = parseInt(currentDraws) + 1
			txtName = 'Location ' + temp; 
		}
		else
		{
			txtName = eleName.value;
		}
	}
		
	//alert('DEBUG: numDraws: preNumDraws/nTitle: ' + txtName + '/nSeed: ' + gblSeed + '/nisPB: ' + lclIsPB);	
	var eleND = document.getElementById('rngNumDraw');
	numDraws = eleND.value;
	
	drawDatabase.transaction(function (tx)
	{
		tx.executeSql('INSERT INTO zenData(title, isPB,seed,numDraws) VALUES(?,?,?,?)',[txtName,lclIsPB,gblSeed,numDraws],loadPage(1),onDbError);
	});
}
